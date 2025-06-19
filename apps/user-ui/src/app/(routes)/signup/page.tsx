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
import axios, { AxiosError } from 'axios';

type FormData = {
  name: string
  email: string;
  password: string;
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  // const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [otp, setOtp] = useState(["","","",""]);
  const [timer, setTimer] = useState(0);
  const  [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showOtp, setShowOtp] = useState(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();


  const handleOtpChange =  (index: number , value: string) => {
    if(!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if(value && index < inputRefs.current.length - 1){
        inputRefs.current[index+1]?.focus();
    }
  }

  const handleOtpKeyDown =  (index : number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Backspace' && !otp[index] && index>0){
        inputRefs.current[index-1]?.focus();
    }
  }


  const resendOtp = () => {
    
  }

  const startResendTimer = () => {
    const interval =  setInterval(() => {
        setTimer((prev) =>{
            if(prev <= 1){
                clearInterval(interval);
                setCanResend(true);
                return 0;
            }
            return prev - 1;
        });
    }, 1000)
  }

  const onSubmit = (data: FormData) => {
    console.log("formData = ", data)
    signupMutation.mutate(data)
  };

  const signupMutation =  useMutation({
    mutationFn: async (data: FormData) => {
        const response =  await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registeration`, data);
        console.log(JSON.stringify(response?.data))
        return response.data;
    },
    onSuccess: (_, formData) => {
        setUserData(formData);
        setShowOtp(true);
        setCanResend(false);
        setTimer(60);
        startResendTimer()
    }
  })


  const verifyMutation =  useMutation({
    mutationFn: async () => {
      if(!userData) return;
      const response  =  await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,{
        ...userData,
        otp: otp.join("")
      })
      return response.data;
    },
    onSuccess: () => {
      router.push("/login")
    }
  })

  return (
    <div className="w-full py-10 min-h-[85vh]">
      <h1 className="text-3xl font-Poppins font-semibold text-black text-center">
        Signup
      </h1>

      <p className="text-center text-lg font-medium py-3 text-[#00000099] ">
        Home . Signup
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-2xl font-semibold text-center mb-2">
            Signup to DOC24x7
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Already have an account?{" "}
            <Link href={"/login"} className="text-blue-500">
              Login
            </Link>
          </p>
          <div className="w-full flex justify-center">
            <GoogleButton />
          </div>

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

           {!showOtp ?
               <form onSubmit={handleSubmit(onSubmit)}>

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
                       value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                       message: "Invalid email address",
                     },
                   })}
                 />
                 {errors.email && (
                   <p className="text-red-500 text-sm">
                     {String(errors.email.message)}
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
                 <button type="submit" disabled={signupMutation.isPending ? true : false} className="w-full text-lg cursor-pointer mt-4 bg-black text-white py-2 rounded-lg">
                     {signupMutation.isPending ? "Signing up..." : "Signup"}
                 </button>
                 {/* {serverError && (<p className="text-red-500 text-sm">{serverError}</p>)} */}
               </form>
               :
               <div>
                  <h3 className="text-xl font-semibold text-center mb-4">Enter OTP</h3>
                   <div className="flex justify-center gap-6">
                    {otp?.map((digit, index) => (<input
                    key={index}
                    type="text"
                    ref={(element) => {if(element) inputRefs.current[index] = element}}
                    maxLength={1}
                    className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />))}
                   </div>
                   <button disabled={verifyMutation.isPending} className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg">
                    {verifyMutation.isPending ? "Verifying..." : "Verify OTP"}
                    </button>
                    <p className="text-center text-sm mt-4">
                        {canResend ? ( <button onClick={resendOtp} className="text-blue-500 cursor-pointer">Resend OTP</button> ) : (`Resend OTP in ${timer}`)}
                    </p>
                    {verifyMutation?.isError &&
                    verifyMutation.error instanceof AxiosError && (
                      <p className="text-red-500 text-sm mt-2">
                         {verifyMutation.error.response?.data?.message || verifyMutation.error.message}
                      </p>
                    )
                    }
               </div>
           }
        </div>
      </div>
    </div>
  );
};

export default Signup;
