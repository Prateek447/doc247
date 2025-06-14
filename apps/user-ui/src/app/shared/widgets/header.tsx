import Link from 'next/link'
import React from 'react'
import { HeartIcon, Search, ShoppingBag } from 'lucide-react';
import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import HeaderBottom from './HeaderBottom';

export default function Header() {
  return (
    <div className='w-full bg-white'>
       <div className="w-[90%] py-5 m-auto flex items-center justify-between">

         <div>
           <Link href={"/"}>
              <span className='text-3sl font-[500]'>DOC24x7</span>
           </Link>
         </div>

         <div className='w-[50%] relative'>
            <input type='text' placeholder='Search for products...' className='w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[35px]'/>
            <div className='w-[60px] cursor-pointer flex items-center justify-center h-[35px] absolute right-0 top-0 bg-[#3489FF]'>
               <Search color="#fff"/>
            </div>
         </div>
            <div className='flex items-center gap-8 pb-2'>
               <div className="flex items-center gap-2">
                <Link href={"/login"} className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]' >
                <ProfileIcon/>
                </Link>
               
                <Link href={"/login"}>
                <span className='block font-medium'>Hello,</span>
                <span className='font-semibold '>Sign In</span>
                </Link>
            </div>
            <div className="flex items-center gap-5">
              <Link href={"/wishlist"} className='relative'>
              <HeartIcon/>
              <div className='w-6 h-6  border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute  top-[-10px] right-[-10px]'>
                <span className='text-white text-xs font-semibold'>0</span>
              </div>
              </Link>
              <Link href={"/cart"} className='relative'>
              <ShoppingBag/>
              <div className='w-6 h-6  border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute  top-[-10px] right-[-10px]'>
                <span className='text-white text-xs font-semibold'>0</span>
              </div>
              </Link>
            </div>
            </div>
       </div>

       <div className='border-b border-b-[#99999938]'/>
        
       <HeaderBottom/>
    </div>
  )
}
