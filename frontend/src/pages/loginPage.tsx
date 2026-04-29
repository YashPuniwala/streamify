import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import { ApiError } from "../types/frontendTypes";

const LoginPage = () => {
  const queryClient = useQueryClient();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const { mutate, isPending, error } = useMutation<
    unknown,
    ApiError,
    typeof loginData
  >({
    mutationFn: login,
    onSuccess: () => {
      console.log("Login successful");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(loginData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-4xl bg-base-100 rounded-lg shadow-lg overflow-hidden">
        {/* LOGIN FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 flex flex-col justify-center">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-7 text-primary" />
            <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>
                {error.response?.data.message ||
                  "An error occurred during login"}
              </span>
            </div>
          )}

          <div className="w-full">
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <h2 className="text-xl font-bold">Welcome Back</h2>
                <p className="text-sm opacity-80 mt-1">
                  Sign in to continue your language learning journey!
                </p>
              </div>

              <div className="space-y-3">
                {/* EMAIL */}
                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-sm">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john@gmail.com"
                    className="input input-bordered w-full h-10"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-sm">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="********"
                    className="input input-bordered w-full h-10"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <button
                className="btn btn-primary w-full h-10 mt-3"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Signing in..." : "Sign In"}
              </button>

              <div className="text-center pt-2">
                <p className="text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    Create One
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE - ILLUSTRATION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-primary/5 to-primary/10 items-center justify-center p-6">
          <div className="w-full max-w-sm text-center">
            <div className="relative aspect-square w-full max-w-xs mx-auto mb-6">
              <img
                src="/i.png"
                alt="Language learning illustration"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-lg font-bold mb-2">
              Connect with language partners worldwide
            </h2>
            <p className="text-sm opacity-80">
              Practice conversations, make friends, and improve your language
              skills together
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;