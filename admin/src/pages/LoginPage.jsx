import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Logging in with", email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-96 p-6 shadow-2xl bg-white rounded-2xl">
          <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
          <p className="text-sm text-center text-gray-500 mb-4">Login to your account</p>
          <CardContent>
            <Input
              type="email"
              placeholder="Email"
              className="mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              className="mb-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold" onClick={handleLogin}>
              Login
            </Button>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button variant="outline" className="flex items-center gap-2">
                <FaGoogle className="text-red-500" /> Google
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FaFacebook className="text-blue-700" /> Facebook
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
