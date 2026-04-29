import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";
import { ApiError } from "../types/frontendTypes";

const SignUpPage = () => {
  const queryClient = useQueryClient(); // Now correctly defined
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { mutate, isPending, error } = useMutation<
    unknown,
    ApiError,
    typeof signupData
  >({
    mutationFn: signup,
    onSuccess: () => {
      console.log("Signup successful");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error("Signup error:", error);
    },
  });

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(signupData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-4xl bg-base-100 rounded-lg shadow-lg overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE */}
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
                {" "}
                {error.response?.data.message ||
                  "An error occurred during signup"}
              </span>
            </div>
          )}

          <div className="w-full">
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div>
                <h2 className="text-xl font-bold">Create an Account</h2>
                <p className="text-sm opacity-80 mt-1">
                  Join Streamify and start your language learning adventure!
                </p>
              </div>

              <div className="space-y-3">
                {/* FULLNAME */}
                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-sm">Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input input-bordered w-full h-10"
                    value={signupData.fullName}
                    onChange={(e) =>
                      setSignupData({ ...signupData, fullName: e.target.value })
                    }
                    required
                  />
                </div>

                {/* EMAIL */}
                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-sm">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="john@gmail.com"
                    className="input input-bordered w-full h-10"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
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
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    required
                  />
                  <label className="label py-1">
                    <span className="label-text-alt text-xs opacity-70">
                      Password must be at least 6 characters long
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-2 py-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      required
                    />
                    <span className="label-text text-xs">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        terms of service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:underline">
                        privacy policy
                      </a>
                    </span>
                  </label>
                </div>
              </div>

              <button
                className="btn btn-primary w-full h-10 mt-3"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Creating Account..." : "Create Account"}
              </button>

              <div className="text-center pt-2">
                <p className="text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
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

export default SignUpPage;
