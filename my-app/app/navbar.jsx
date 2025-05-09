"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { BsShare } from "react-icons/bs";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { supabase } from "./lib/supabaseClient";
import Link from "next/link";
import { MdLogout } from "react-icons/md";
import { GiMedicines } from "react-icons/gi";
import { TbMapSearch } from "react-icons/tb";
import { IoWarningOutline } from "react-icons/io5";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { MdOutlineSchedule } from "react-icons/md";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login"; // or just refresh with location.reload();
  };
  const sideList = [
    {
      icon: <GiMedicines  className="text-2xl" />,
      title: "Medication Interactions",
      href: "/med-conflicts",
    },
    {
      icon: <TbMapSearch  className="text-2xl" />,
      title: "Medication Availability",
      href: "/med-avail",
    },
    {
      icon: <IoWarningOutline   className="text-2xl" />,
      title: "Recall information",
      href: "/recall-info",
    },
    {
      icon: <MdOutlineSchedule  className="text-2xl" />,
      title: "Set Reminders",
      href: "/reminders",
    },
    {
      icon: <RiCalendarScheduleLine  className="text-2xl" />,
      title: "View Reminders",
      href: "/view-reminders",
    },
  ];

  const navList = [
    {
      icon: <AiOutlineHome className="text-2xl mr-2" />,
      title: "Home",
      href: "/",
    },
    {
      icon: <IoIosInformationCircleOutline className="text-2xl mr-2" />,
      title: "About",
      href: "/about",
    },

    ...(!user
      ? [
        {
          icon: <AiOutlineHome className="text-2x1 mr-2" />,
          title: "Sign In",
          href: "/login",
        },
      ]
      : []),
  ];

  const handleDrawer = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleEscKeyPress = (e) => {
      if (e.keyCode === 27 && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.setProperty("overflow", "hidden");
    } else {
      document.body.style.removeProperty("overflow");
    }

    document.addEventListener("keydown", handleEscKeyPress);

    return () => {
      document.removeEventListener("keydown", handleEscKeyPress);
    };
  }, [isOpen]);

  return (
    <nav className="sticky top-0 flex w-full items-center justify-between px-6 h-16 bg-white text-gray-700 border-b border-gray-200 z-50">
      <div className="flex items-center">
        <button className="mr-2" aria-label="Open Menu" onClick={handleDrawer}>
          <GiHamburgerMenu className="text-3xl" />
        </button>

        <img
          src="https://media.discordapp.net/attachments/1350336370626789426/1363251659324653588/Screenshot_2025-04-19_133128.png?ex=68055a8b&is=6804090b&hm=d88d687c1f8bd935bf3357e77d7de64f43dd4b1a8e21e253bbc106a140cefd47&=&format=webp&quality=lossless&width=1560&height=926"
          alt="Logo"
          className="h-auto w-24"
        />
      </div>

      <div className="flex items-center">
        <div className="hidden md:flex md:justify-between md:bg-transparent">
          {navList.map(({ icon, title, href }, index) => (
            <Link key={index} href={href || "#"}>
              <button
                title={title}
                className="flex items-center p-3 font-medium mr-2 text-center bg-gray-300 rounded hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
              >
                <span>{icon}</span>
                <span>{title}</span>
              </button>
            </Link>
          ))}
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center p-3 font-medium mr-2 text-center bg-gray-300 rounded hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
            >
              <MdLogout className="text-2xl mr-2" />
              <span>Logout</span>
            </button>
          )}

        </div>
      </div>

      {isOpen && (
        <div className="z-10 fixed inset-0 transition-opacity">
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black opacity-50"
            tabIndex="0"
          ></div>
        </div>
      )}

      <aside
        className={`transform top-0 left-0 w-64 bg-white fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <span className="flex w-full items-center p-4 border-b">
          <img
            src="https://media.discordapp.net/attachments/1350336370626789426/1363251659324653588/Screenshot_2025-04-19_133128.png?ex=68055a8b&is=6804090b&hm=d88d687c1f8bd935bf3357e77d7de64f43dd4b1a8e21e253bbc106a140cefd47&=&format=webp&quality=lossless&width=1560&height=926"
            alt="Logo"
            className="h-auto w-32 mx-auto"
          />
        </span>
        {sideList.map(({ icon, title, href }, index) => (
          <Link key={index} href={href || "#"}>
            <span className="flex items-center p-4 hover:bg-pink-500 hover:text-white cursor-pointer">
              <span className="mr-2">{icon}</span>
              <span>{title}</span>
            </span>
          </Link>
        ))}

        <div className="fixed bottom-0 w-full">
          <button className="flex items-center p-4 text-white bg-blue-500 hover:bg-blue-600 w-full">
            <span className="mr-2">
              <BsShare className="text-2xl" />
            </span>

            <span>Share</span>
          </button>
        </div>
      </aside>
    </nav>
  );
};

export default Navbar;