"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
// import GoogleButton from "../../shared/components/GoogleButton";
import GoogleButton from "react-google-button";
import { Eye, EyeOff } from "lucide-react";
import e from "express";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { count } from "console";
import { countries } from "./../../utils/countries";

// type FormData = {
//   name: string
//   email: string;
//   password: string;
// };

const Signup = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showOtp, setShowOtp] = useState(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (userData) {
      signupMutation.mutate(userData);
    }
  };

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = (data: any) => {
    console.log("formData = ", data);
    setServerError(null); // Clear any previous errors
    signupMutation.mutate(data);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Using API Gateway instead of direct auth service
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
      setServerError(null);
    },
    onError: (error: any) => {
      if (error instanceof AxiosError) {
        setServerError(
          error.response?.data?.message ||
            "Registration failed. Please try again."
        );
      } else {
        setServerError("Registration failed. Please try again.");
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      // Using API Gateway instead of direct auth service
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,
        {
          ...userData,
          otp: otp.join(""),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error: any) => {
      if (error instanceof AxiosError) {
        setServerError(
          error.response?.data?.message ||
            "OTP verification failed. Please try again."
        );
      } else {
        setServerError("OTP verification failed. Please try again.");
      }
    },
  });

  const handleVerifyOtp = () => {
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      setServerError("Please enter a valid 4-digit OTP");
      return;
    }
    setServerError(null);
    verifyMutation.mutate();
  };

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen">
      <div className="relative flex items-center justify-between md:w-[50%] mb-8">
        <div className="absolute top-[25%] left-o w-[80%] md: w-[90%] h-1 bg-gray-300 -z-10" />
        {[1, 2, 3].map((step) => (
          <div key={step}>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${
                step <= activeStep ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              {step}
            </div>
            <span className="ml-[-15px]">
              {step === 1
                ? "Create Account"
                : step === 2
                ? "Setup Shop"
                : "Connect Bank"}
            </span>
          </div>
        ))}
      </div>

      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font-semibold text-center mb-4">
                  Create Account
                </h3>
                <label className="block text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Ram"
                  className="w-full p-2 border border-gray-300 outline-o !rounded mb-1"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">
                    {String(errors.name.message)}
                  </p>
                )}

                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="support@doc24x7.com"
                  className="w-full p-2 border border-gray-300 outline-o !rounded mb-1"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {String(errors.email.message)}
                  </p>
                )}

                <label className="block text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="w-full p-2  border border-gray-300 outline-0 !rounded mb-1"
                  {...register("phone_number", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Invalid phone number",
                    },
                    minLength: {
                      value: 10,
                      message: "Phone number must be at least 10 digits",
                    },
                    maxLength: {
                      value: 15,
                      message: "Phone number must be at most 10 digits",
                    },
                  })}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm">
                    {String(errors.phone_number.message)}
                  </p>
                )}

                <label className="block text-gray-700 mb-1">Country</label>
                <select
                  className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
                  {...register("country", {
                    required: "Country is required",
                  })}
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm">
                    {String(errors.country.message)}
                  </p>
                )}

                <label className="block text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Min. 6 Characters"
                    className="w-full p-2  border border-gray-300 outline-0 !rounded mb-1"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {String(errors.password.message)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  >
                    {passwordVisible ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signupMutation.isPending ? "Signing up..." : "Signup"}
                </button>

                {signupMutation.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className=" [text-red-500 text-sm mt-2">
                      {signupMutation.error.response?.data?.message ||
                        signupMutation.error.message}
                    </p>
                  )}

                  <p className="pt-3 text-center">
                    Already have an account?{" "}
                    <Link   
                      href="/login"
                      className="text-blue-500 hover:underline">
                        Login
                        </Link>
                  </p>
              </form>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-center mb-4">
                  Enter OTP
                </h3>
                <p className="text-center text-gray-600 mb-4">
                  We've sent a verification code to{" "}
                  <strong>{userData?.email}</strong>
                </p>
                <div className="flex justify-center gap-6 mb-4">
                  {otp?.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      ref={(element) => {
                        if (element) inputRefs.current[index] = element;
                      }}
                      maxLength={1}
                      className="w-12 h-12 text-center border border-gray-300 outline-none !rounded text-lg font-semibold"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={
                    verifyMutation.isPending || otp.join("").length !== 4
                  }
                  className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify OTP"}
                </button>
                <p className="text-center text-sm mt-4">
                  {canResend ? (
                    <button
                      onClick={resendOtp}
                      className="text-blue-500 cursor-pointer hover:underline"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    `Resend OTP in ${timer}s`
                  )}
                </p>
                {serverError && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    {serverError}
                  </p>
                )}
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowOtp(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Back to registration
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="w-full py-10 min-h-screen"></div>
    </div>
  );
};

export default Signup;
