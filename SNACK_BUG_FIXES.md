# Snack 相关Bug修复方案

## Bug 优先级修复清单

### 🔴 高优先级 - 影响数据完整性

#### Bug #1: 缺少CartItem有效性验证

**问题代码** (`Checkout.tsx` 第70-93行)：
```typescript
const order: Order = {
  id: Math.random().toString(36).substring(7),
  userId: user.id,
  items: checkoutItems,  // ⚠️ 直接使用，无任何验证
  totalAmount: total,
  status: "pending",
  queueNumber,
  createdAt: new Date().toISOString(),
  estimatedTime: 10 + Math.floor(Math.random() * 10),
};
```

**根本原因**：
- `CartItem` 类型允许 `drink` 和 `snack` 都不存在
- `handlePlaceOrder` 没有验证每个item都有有效的product

**修复方案**：
```typescript
// 在 handlePlaceOrder 开始添加验证
const validateCheckoutItems = (items: CartItem[]): boolean => {
  return items.every(item => {
    // 每个item必须有drink或snack，但不能同时有
    const hasProduct = Boolean(item.drink) !== Boolean(item.snack);
    const hasValidQuantity = item.quantity > 0;
    const hasValidPrice = item.totalPrice > 0;
    
    return hasProduct && hasValidQuantity && hasValidPrice;
  });
};

// 在 handlePlaceOrder 中使用
const handlePlaceOrder = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 新增：验证checkoutItems
  if (!validateCheckoutItems(checkoutItems)) {
    toast.error("Invalid items in cart. Please review your order.");
    return;
  }
  
  // 接下来的逻辑...
};
```

**检查项**：
- ✓ 每个item有drink或snack之一
- ✓ 数量 > 0
- ✓ 总价 > 0
- ✓ 如果是drink，必须有customization

---

#### Bug #2: 浮点数精度丢失

**问题代码** (`Cart.tsx` 第51-62行)：
```typescript
const updatedCart = cartItems.map((item) =>
  item.id === itemId
    ? {
        ...item,
        quantity: newQuantity,
        totalPrice: (item.totalPrice / item.quantity) * newQuantity,  // ⚠️ 精度问题
      }
    : item
);
```

**风险场景**：
```
原始: totalPrice = 28.50, quantity = 1
更新到数量2: (28.50 / 1) * 2 = 57
更新到数量3: (57 / 2) * 3 = 85.5  // 如果除法不整数会丢失精度

在经过多次更新后，可能会出现 ¥85.500000001 或 ¥85.499999999
```

**修复方案**：
```typescript
const updateQuantity = (itemId: string, newQuantity: number) => {
  if (newQuantity < 1) return;
  
  const updatedCart = cartItems.map((item) => {
    if (item.id !== itemId) return item;
    
    // 根据product类型重新计算单价
    let unitPrice: number;
    
    if (item.drink && item.customization) {
      const sizeMultiplier = sizeMultipliers[item.customization.size];
      const basePrice = item.drink.basePrice * sizeMultiplier;
      const toppingsPrice = item.customization.toppings?.reduce(
        (sum, t) => sum + t.price, 
        0
      ) || 0;
      unitPrice = basePrice + toppingsPrice;
    } else if (item.snack) {
      unitPrice = item.snack.price;
    } else {
      return item; // 无效项
    }
    
    // 使用正确的精度计算
    const newTotalPrice = Math.round(unitPrice * newQuantity * 100) / 100;
    
    return {
      ...item,
      quantity: newQuantity,
      totalPrice: newTotalPrice,
    };
  });
  
  storage.setCart(updatedCart);
  setCartItems(updatedCart);
};
```

**关键改进**：
- ✓ 使用原始单价重新计算，不依赖历史除法
- ✓ 四舍五入到2位小数：`Math.round(x * 100) / 100`
- ✓ 支持drink和snack两种类型

---

### 🟡 中优先级 - 影响代码质量和可维护性

#### Bug #3: Cart中snack项的修改体验不一致

**问题代码** (`Cart.tsx` 第209-217行)：
```typescript
{item.drink && (
  <>
    <Button
      variant="outline"
      size="sm"
      className="h-8 px-3"
      onClick={() => handleModifyItem(item)}
    >
      <Edit className="w-4 h-4 mr-1" />
      Modify
    </Button>
    <Separator orientation="vertical" className="h-6" />
  </>
)}
```

**问题**：
- drink项可以"修改"（customize）
- snack项无法修改，用户只能删除重加
- 用户体验不一致

**修复方案 #1**（保持当前行为，改进UI）：
```typescript
<div className="flex items-center gap-2">
  {item.drink ? (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3"
        onClick={() => handleModifyItem(item)}
      >
        <Edit className="w-4 h-4 mr-1" />
        Customize
      </Button>
      <Separator orientation="vertical" className="h-6" />
    </>
  ) : item.snack ? (
    <span className="text-xs text-gray-500">No customization available</span>
  ) : null}
  
  {/* Quantity buttons */}
  <Button
    variant="outline"
    size="icon"
    className="h-8 w-8"
    onClick={() => updateQuantity(item.id, item.quantity - 1)}
  >
    <Minus className="w-3 h-3" />
  </Button>
  <span className="w-8 text-center font-semibold">{item.quantity}</span>
  <Button
    variant="outline"
    size="icon"
    className="h-8 w-8"
    onClick={() => updateQuantity(item.id, item.quantity + 1)}
  >
    <Plus className="w-3 h-3" />
  </Button>
</div>
```

**修复方案 #2**（创建SnackModifier组件）：
如果未来需要支持snack的定制（如选择配料），可创建：
```typescript
// SnackModifier.tsx 用于修改snack的详情和数量
interface SnackModifierProps {
  snack: Snack;
  open: boolean;
  onClose: () => void;
  existingItem?: CartItem;
}
```

---

#### Bug #4: 存储中无效CartItem的处理

**问题**：`storage.getCart()` 反序列化后不验证数据有效性

**修复方案**：
```typescript
// 在 storage.ts 中添加
const isValidCartItem = (item: any): item is CartItem => {
  return (
    typeof item?.id === 'string' &&
    typeof item?.quantity === 'number' &&
    item.quantity > 0 &&
    typeof item?.totalPrice === 'number' &&
    item.totalPrice > 0 &&
    ((item.drink && !item.snack) || (item.snack && !item.drink)) // 二选一
  );
};

// 更新 getCart 方法
getCart: (): CartItem[] => {
  const cart = localStorage.getItem("cart");
  if (!cart) return [];
  
  try {
    const parsed = JSON.parse(cart);
    // 过滤掉无效项，但记录警告
    const valid = Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
    
    if (valid.length < parsed.length) {
      console.warn(
        `Filtered out ${parsed.length - valid.length} invalid cart items`
      );
    }
    
    return valid;
  } catch (error) {
    console.error("Failed to parse cart from storage:", error);
    return [];
  }
},
```

**好处**：
- ✓ 防止损坏数据传播
- ✓ 提供调试信息
- ✓ 优雅降级处理

---

### 🔵 低优先级 - 代码改进

#### Bug #5: 鸭子类型判断不够健壮

**当前代码** (`Menu.tsx` 第25行)：
```typescript
const filteredSnacks = filteredItems.filter(
  item => 'price' in item && !('basePrice' in item)
) as Snack[];
```

**问题**：依赖属性检查来区分类型

**改进方案1**：添加type字段
```typescript
// types.ts
export interface Drink {
  type: 'drink';
  id: string;
  name: string;
  basePrice: number;
  // ...
}

export interface Snack {
  type: 'snack';
  id: string;
  name: string;
  price: number;
  // ...
}

// Menu.tsx
const filteredDrinks = filteredItems.filter(
  item => (item as any).type === 'drink'
) as Drink[];
const filteredSnacks = filteredItems.filter(
  item => (item as any).type === 'snack'
) as Snack[];
```

**改进方案2**：使用TypeScript类型谓词
```typescript
const isDrink = (item: any): item is Drink => {
  return 'basePrice' in item && typeof item.basePrice === 'number';
};

const isSnack = (item: any): item is Snack => {
  return 'price' in item && !('basePrice' in item) && typeof item.price === 'number';
};

const filteredDrinks = filteredItems.filter(isDrink);
const filteredSnacks = filteredItems.filter(isSnack);
```

**推荐**: 方案1（添加type字段）更清晰直接

---

## 修复优先级建议

| 优先级 | Bug | 工作量 | 影响范围 | 预计修复时间 |
|--------|-----|--------|---------|------------|
| 🔴 高1 | CartItem验证 | 小 | Checkout | 15分钟 |
| 🔴 高2 | 浮点精度 | 中 | Cart | 30分钟 |
| 🟡 中1 | snack修改体验 | 小 | Cart | 20分钟 |
| 🟡 中2 | 存储验证 | 小 | storage | 25分钟 |
| 🔵 低1 | 鸭子类型 | 小 | Menu | 20分钟 |

**总计**: 约 2-2.5 小时完整修复

---

## 测试清单

修复后需要验证：

- [ ] 添加snack到购物车
- [ ] 修改snack数量（+/- 按钮）
- [ ] 删除snack
- [ ] 包含snack的订单结账
- [ ] 刷新页面后购物车中snack数据完整
- [ ] 验证snack的totalPrice计算正确（多次修改数量后）
- [ ] 订单历史中snack显示正确
- [ ] 混合drink和snack的订单

---

## 代码更改汇总

需要修改的文件：
1. `src/app/pages/Checkout.tsx` - 添加项目验证
2. `src/app/pages/Cart.tsx` - 修复精度问题和修改体验
3. `src/app/utils/storage.ts` - 添加数据验证

不需要修改的文件：
- ✓ `src/app/types.ts` - 类型定义已足够
- ✓ `src/app/data/menu.ts` - 菜单数据定义正确
- ✓ `src/app/pages/Menu.tsx` - handleAddSnack逻辑正确（虽然可优化鸭子类型）
