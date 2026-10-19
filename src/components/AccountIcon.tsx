import React from "react";
import {
  User,
  Briefcase,
  ShoppingBag,
  Headphones,
  Shield,
  MessageCircle,
  Star,
  Sparkles,
  Building,
  Phone,
} from "lucide-react";

interface AccountIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export const AccountIcon: React.FC<AccountIconProps> = ({
  iconName,
  className = "w-4 h-4",
  size = 18,
}) => {
  switch (iconName.toLowerCase()) {
    case "briefcase":
    case "business":
    case "work":
      return <Briefcase size={size} className={className} />;
    case "shopping-bag":
    case "sales":
    case "store":
      return <ShoppingBag size={size} className={className} />;
    case "headphones":
    case "support":
    case "service":
      return <Headphones size={size} className={className} />;
    case "shield":
    case "security":
    case "admin":
      return <Shield size={size} className={className} />;
    case "star":
    case "vip":
      return <Star size={size} className={className} />;
    case "sparkles":
      return <Sparkles size={size} className={className} />;
    case "building":
      return <Building size={size} className={className} />;
    case "phone":
      return <Phone size={size} className={className} />;
    case "message-circle":
    case "chat":
      return <MessageCircle size={size} className={className} />;
    case "user":
    case "personal":
    default:
      return <User size={size} className={className} />;
  }
};
