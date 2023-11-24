import React from "react";



type PopFiLandingPageColumnvectorProps = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "userimage" | "usertext"
> &
  Partial<{ userimage: string; usertext: JSX.Element | string }>;

const PopFiLandingPageColumnvector: React.FC<
  PopFiLandingPageColumnvectorProps
> = (props) => {
  return (
    <>
      <div className={props.className}>
        <div className="p-[2px] bg-gradient-to-t from-[#0B7A55] to-[#34C796] rounded-[50%] items-center justify-start ">
        <div className="bg-[#0B111B] flex flex-col h-20 items-center justify-start p-[16px] rounded-[50%]  w-20">
          {!!props?.userimage ? (
            <img
                className={`h-[35px] h-auto object-cover ${props.userimage === "images/img_vector.png" ? "my-1" : ""}`}
              alt="vector"
              src={props?.userimage}
            />
          ) : null}
        </div>
        </div>
        <div
          className="leading-[140.00%] max-w-[367px] md:max-w-full text-[#B4B5C7] text-center text-lg"
        >
          {props?.usertext}
        </div>
      </div>
    </>
  );
};

PopFiLandingPageColumnvector.defaultProps = {
  usertext: (
    <>
      Dive into the realm of fast trading, powered by Solana&#39;s blockchain
      capabilities.
    </>
  ),
};

export default PopFiLandingPageColumnvector;
