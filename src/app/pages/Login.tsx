import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { storage } from "../utils/storage";
import { generateCoupons } from "../utils/coupons";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "verify" | "reset">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    // Mock login - in real app, verify credentials
    const user = {
      id: Math.random().toString(36).substring(7),
      email: loginEmail,
      name: loginEmail.split("@")[0],
      points: 0,
      coupons: generateCoupons(),
      feedbacks: [],
    };

    storage.setUser(user);
    toast.success("Login successful!");
    navigate("/menu");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerName || !registerEmail || !registerPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (registerPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Mock registration
    const user = {
      id: Math.random().toString(36).substring(7),
      email: registerEmail,
      name: registerName,
      points: 0,
      coupons: generateCoupons(),
      feedbacks: [],
    };

    storage.setUser(user);
    toast.success("Registration successful!");
    navigate("/menu");
  };

  const handleForgotPasswordEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }

    // Generate mock verification code
    const code = Math.random().toString().slice(2, 8);
    sessionStorage.setItem("verificationCode", code);
    sessionStorage.setItem("resetEmail", forgotEmail);
    
    toast.success(`Verification code sent to ${forgotEmail}!`);
    setForgotStep("verify");
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    const savedCode = sessionStorage.getItem("verificationCode");
    if (verificationCode !== savedCode) {
      toast.error("Invalid verification code");
      return;
    }

    setForgotStep("reset");
    toast.success("Verification successful!");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmNewPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Mock password reset
    toast.success("Password reset successful!");
    setShowForgotPassword(false);
    setForgotStep("email");
    setForgotEmail("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    sessionStorage.removeItem("verificationCode");
    sessionStorage.removeItem("resetEmail");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4">
            <span className="text-5xl">🧋</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Bubble Tea Shop
          </h1>
          <p className="text-gray-600">Order your favorite drinks</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Login or create an account to start ordering</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                    Login
                  </Button>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="w-full text-orange-600 hover:text-orange-700"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Your name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                    Register
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            {forgotStep === "email" && (
              <DialogDescription>Enter your email to receive a verification code</DialogDescription>
            )}
            {forgotStep === "verify" && (
              <DialogDescription>Enter the verification code sent to your email</DialogDescription>
            )}
            {forgotStep === "reset" && (
              <DialogDescription>Create your new password</DialogDescription>
            )}
          </DialogHeader>

          {/* Email Step */}
          {forgotStep === "email" && (
            <form onSubmit={handleForgotPasswordEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotStep("email");
                    setForgotEmail("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600">
                  Send Code
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Verification Code Step */}
          {forgotStep === "verify" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-700">
                  Check your email for the 6-digit verification code
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgotStep("email");
                    setVerificationCode("");
                  }}
                >
                  Back
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600">
                  Verify
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Reset Password Step */}
          {forgotStep === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgotStep("verify");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
                >
                  Back
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600">
                  Reset Password
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}