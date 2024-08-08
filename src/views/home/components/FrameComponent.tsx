import { FunctionComponent, useMemo, type CSSProperties } from "react";

export type FrameComponentType = {
  className?: string;
  vuesaxbulkimport?: string;
  deposit?: string;
  depositYourTokensAndStart?: string;

  /** Style props */
  propMinHeight?: CSSProperties["minHeight"];
};

const FrameComponent: FunctionComponent<FrameComponentType> = ({
  className = "",
  propMinHeight,
  vuesaxbulkimport,
  deposit,
  depositYourTokensAndStart,
}) => {
  const frameDiv3Style: CSSProperties = useMemo(() => {
    return {
      minHeight: propMinHeight,
    };
  }, [propMinHeight]);

  return (
    <div
      className={`self-stretch w-full flex-1 rounded-3xl bg-bg flex flex-col items-start justify-start py-6 px-12 box-border min-w-[313px] max-w-full text-left xl:text-[40px] text-[35px] text-neutral-06 font-gilroy-bold mq450:gap-5 mq450:pl-5 mq450:pr-5 mq450:box-border ${className}`}
      style={frameDiv3Style}
    >
      <div className="self-stretch flex flex-col items-start justify-start gap-2">
        <img
          className="w-16 h-16 relative"
          loading="lazy"
          alt=""
          src={vuesaxbulkimport}
        />
        <h1 className="m-0 self-stretch relative text-inherit tracking-[-0.03em] leading-[58px] font-normal font-[inherit] mq450:text-10xl mq450:leading-[35px] mq1050:text-19xl mq1050:leading-[46px]">
          {deposit}
        </h1>
        <div className="self-stretch relative text-lg tracking-[-0.03em] leading-[120.41%] font-gilroy-regular text-gray-300">
          {depositYourTokensAndStart}
        </div>
      </div>
    </div>
  );
};

export default FrameComponent;
