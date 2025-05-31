interface DropdownItemProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const DropdownItem = ({ href, icon, children }: DropdownItemProps) => {
  return (
    <a
      href={href}
      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-[#0CF2A0] hover:bg-gray-800/50"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </a>
  );
};