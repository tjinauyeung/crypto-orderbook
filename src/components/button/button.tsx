import "twin.macro";

export const Button = ({ children, onClick, ...props }) => (
  <button
    tw="py-4 px-8 w-full md:w-auto rounded outline-none border-none bg-purple-800 text-white cursor-pointer hover:bg-purple-900 transition duration-200"
    onClick={onClick ? onClick : () => null}
    {...props}
  >
    {children}
  </button>
);
