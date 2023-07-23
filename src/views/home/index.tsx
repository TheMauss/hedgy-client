import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { FaAngleUp, FaAngleDown, FaHourglassHalf } from 'react-icons/fa';
import { FaShield, FaUserCheck, FaWallet, FaPlay } from 'react-icons/fa6';
import { useSpring, animated, config, useTransition } from 'react-spring';
import { useWindowScrollPosition } from '../../components/getwindowscroll';
import { useInView } from "react-intersection-observer";
import { useMediaQuery } from 'react-responsive';

export const HomeView: FC = ({ }) => {
  const [toggleState, setToggleState] = useState('PUMP');
  

  const handleToggleChange = () => {
    if (toggleState === 'PUMP') {
      setToggleState('DUMP');
    } else {
      setToggleState('PUMP');
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
  
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollPos = useWindowScrollPosition();
  const scale = 0.6 + scrollPos / 1000 > 1 ? 1 - ((0.6 + scrollPos / 1000 - 1) * 0.3) : 0.6 + scrollPos / 1000;

  const springProps = useSpring({
    from: { 
      transform: 'scale(0.6) translate3d(0,0,0)', 
      WebkitTransform: 'scale(0.6) translate3d(0,0,0)' 
    },
    to: { 
      transform: `scale(${scale}) translate3d(0,0,0)`,
      WebkitTransform: `scale(${scale}) translate3d(0,0,0)` 
    },
    config: config.gentle,
  });

  const { ref: ref1, inView: inView1 } = useInView({
    threshold: 0.8, 
    rootMargin: '0px 0px 0px 0px', 
    triggerOnce: true, 
  });
  
  const props1 = useSpring({
    opacity: inView1 ? 1 : 0,
    transform: inView1 ? "translateY(0)" : "translateY(-100px)",
  });
  
    // Second div animation
    const { ref: refs, inView: inViews } = useInView({
      threshold: 0.7, 
      rootMargin: '0px 0px 0px 0px', 
      triggerOnce: true, 
    });
    
    const propss = useSpring({
      opacity: inViews ? 1 : 0,
      transform: inViews ? "translateY(0)" : "translateY(-100px)",
    });

  // Second div animation
  const { ref: ref2, inView: inView2 } = useInView({
    threshold: 0.5, 
    rootMargin: '0px 0px 0px 0px', 
    triggerOnce: true, 
  });
  
  const props2 = useSpring({
    opacity: inView2 ? 1 : 0,
    transform: inView2 ? "translateY(0)" : "translateY(-100px)",
  });

  const transformValueDesktop = "translateY(-100px)";
  const transformValueMobile1 = "translateX(100px)";
  const transformValueMobile2 = "translateX(-100px)";

    // Second div animation
    const { ref: ref3, inView: inView3 } = useInView({
      threshold: 0.5, 
      rootMargin: '0px 0px 0px 0px', 
      triggerOnce: true, 
    });
    
    const props3 = useSpring({
      opacity: inView3 ? 1 : 0,
      transform: inView3 ? "translateY(0)" : (isMobile ? transformValueMobile1 : transformValueDesktop),
    });







        // Second div animation
        const { ref: ref4, inView: inView4 } = useInView({
          threshold: 0.5, 
          rootMargin: '0px 0px 0px 0px', 
          triggerOnce: true, 
        });
        
        const props4 = useSpring({
          opacity: inView4 ? 1 : 0,
          transform: inView4 ? "translateY(0)" : (isMobile ? transformValueMobile2 : transformValueDesktop),
        });

        const { ref: ref5, inView: inView5 } = useInView({
          threshold: 0.5, 
          rootMargin: '0px 0px 0px 0px', 
          triggerOnce: true, 
        });
        
        const props5 = useSpring({
          opacity: inView5 ? 1 : 0,
          transform: inView5 ? "translateY(0)" : (isMobile ? transformValueMobile1 : transformValueDesktop),
        });
        
    const { ref: ref6, inView: inView6 } = useInView({
      threshold: 0.5, 
      rootMargin: '0px 0px 0px 0px', 
      triggerOnce: true, 
    });
    
    const props6 = useSpring({
      opacity: inView6 ? 1 : 0,
      transform: inView6 ? "translateY(0)" : (isMobile ? transformValueMobile2 : transformValueDesktop),
    });
      
        const { ref: ref7, inView: inView7 } = useInView({
          threshold: 0.5, 
          rootMargin: '0px 0px 0px 0px', 
          triggerOnce: true, 
        });
        
        const props7 = useSpring({
          opacity: inView7 ? 1 : 0,
          transform: inView7 ? "translateY(0)" : (isMobile ? transformValueMobile1 : transformValueDesktop),
        });

                // Second div animation
                const { ref: ref8, inView: inView8 } = useInView({
                  threshold: 0.5, 
                  rootMargin: '0px 0px 0px 0px', 
                  triggerOnce: true, 
                });
                
                const props8 = useSpring({
                  opacity: inView8 ? 1 : 0,
                  transform: inView8 ? "translateY(0)" : (isMobile ? transformValueMobile2 : transformValueDesktop),
                });

                        // Second div animation
        const { ref: ref9, inView: inView9 } = useInView({
          threshold: 0.5, 
          rootMargin: '0px 0px 0px 0px', 
          triggerOnce: true, 
        });
        
        const props9 = useSpring({
          opacity: inView9 ? 1 : 0,
          transform: inView9 ? "translateY(0)" : "translateY(-100px)",
        });


  
  return (
    <div className="flex justify-center">
    <div className="w-[97%] xl:w-[75%] lg:w-[75%] md:w-[75%] sm:w-[75%] md:min-w-[800px] sm:min-w-[97%] md:pt-24 pt-16">
    <div className="custom-scrollbar w-[100%] bg-transparent rounded">
  <div className="flex flex-col sm:flex-row justify-center items-center h-[100%] ">
    <div className="w-[98%] md:w-[45%]  flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 bg-transparent rounded sm:pt-0 pt-3 sm:order-1">
      <h1 className="text-center text-[4.05rem] font-bold text-transparent bg-clip-text bg-slate-300 pt-4 pb-8">
        PopFi
      </h1>
      <h2 className="text-center text-2xl mt-4 font-bold text-transparent bg-clip-text bg-slate-300 ml-5 mr-5">
      Pop Your Potential in Every Trade with Solana-Built Binary Options.
      </h2>
      <div className="text-center text-3xl mt-4 font-bold text-[#1a1a25] bg-green-500 rounded-full hover:bg-green-500 hover:text-[#1a1a25] transform hover:scale-110 shadow component order-1 sm:block hidden">
          <Link href="/trade">
            <button className="mr-4 ml-4 mt-1 mb-2">Experience Now</button>
          </Link>
      </div>
    </div>
    <div className="w-[98%] md:w-[45%] h-[450px] flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300 bg-transparent rounded order-2">
      <h1 className="justify-center items-center">
        <img src="/2.png" alt="Logo" className="w-80 h-80 sm:w-[100%] sm:h-[100%] max-w-[420px]" />
      </h1>
      <div className="mb-12 text-center text-3xl font-bold text-[#1a1a25] bg-green-500 rounded-full hover:bg-green-500 hover:text-[#1a1a25] transform hover:scale-110 shadow component order-1 sm:hidden block">
          <Link href="/trade">
            <button className="mr-4 ml-4 mt-1 mb-2">Experience Now</button>
          </Link>
      </div>
    </div>
  </div>
</div>
<div 
  className="flex justify-center items-center mt-16" 
>
<animated.div style={springProps}>
      <div className="bg-transparent">
        <div className="rounded-xl md:border-8 border-2 border-slate-300 flex justify-center items-center">
        <img src="/trading.png" alt="Logo" style={{ height: 'auto' }} className="w-full h-full rounded-xl" />
        </div>
      </div>
    </animated.div>
</div>


  <div className="flex justify-center items-center pt-20">
  <div className="custom-scrollbar w-[98%] md:[80%] md:h-[400px] bg-transparent mt-2 rounded">
    <div className="flex flex-col md:flex-row justify-center items-center">

      <div className="md:w-[60%] w-[98%] h-[400px] flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300  bg-transparent rounded order-1 md:order-2">
      <animated.div ref={ref1} style={props1}> <h2 className="text-center text-3xl ml-2 mt-2 mb-6 font-bold text-transparent bg-clip-text bg-slate-300">
          Why PopFi?
        </h2>
        <div className="flex justify-center items-center">
          <h2 className="text-start text-2xl font-semibold text-transparent bg-clip-text bg-slate-300 ml-5 mr-5">
            Because we simplify trading. Just determine whether the price of a specific cryptocurrency will go up or down within a specific timeframe and <span className="text-transparent bg-clip-text bg-[#D4AF37]">make it pop.</span>
          </h2>
        </div>
        <div className="w-[65%] mt-6 flex justify-between items-center gap-4 font-semibold text-sm md:text-base text-white">
          <div className="toggle-button" onClick={handleToggleChange}>
            <div className="text-state">
              <>
                <FaAngleUp className="text-green-500" />
                <span>PUMP</span>
              </>
            </div>
            <div className="text-state" style={{ left: "50%" }}>
              <>
                <FaAngleDown className="text-red-500" />
                <span className="ml-1">DUMP</span>
              </>
            </div>
            <div
              className={`toggle-state ${
                toggleState === "PUMP" ? "bg-green-500" : "bg-red-500 right-0"
              }`}
            >
              {toggleState}
            </div>
          </div>
        </div>
        <h2 className="text-start text-2xl font-semibold text-transparent bg-clip-text bg-slate-300 ml-3 mr-3 mt-6">
          Say goodbye to complicated trading strategies and hello to effortless profitability.
        </h2>      </animated.div>
      </div>


      <div className="md:w-[40%] w-[98%] h-[400px] md:mt-0 mt-6 flex flex-col justify-center items-center text-center text-lg md:text-xl text-slate-300  bg-transparent rounded order-2 md:order-1">
      <animated.div ref={refs} style={propss}><div className="mr-32 flex justify-center items-center floating text-2xl font-bold text-green-500">
          <FaAngleUp className=" text-green-500 text-[11.05rem] " /> PUMP
        </div>
        <h2 className="text-center text-3xl font-bold text-transparent bg-clip-text bg-slate-300">
          BTC/USD - 30521
        </h2>
        <div className="ml-32 flex justify-center items-center floatingg text-2xl font-bold text-red-500">
          DUMP
          <FaAngleDown className="text-red-500 text-[11.05rem]" />
        </div>      </animated.div>
      </div>

    </div>
    
  </div>
</div>


<animated.div ref={ref2} style={props2}>
        <h2 className="pt-8 text-center text-3xl mt-32 font-bold text-transparent bg-clip-text bg-slate-300">
            Key Features
        </h2>
        </animated.div>
        <div className="flex justify-center items-center overflow-x-hidden mt-8">
        <div className="w-[98%] md:w-[80%] md:h-[260px] bg-transparent mt-2 rounded  ">
        <div className="flex md:flex-row flex-col  justify-center items-center">
        <animated.div ref={ref3} style={props3} className="md:w-1/3 w-[70%] min-w-[240px] h-[260px] md:mt-0 mt-12">
        <div className="flex flex-col justify-center items-center custom-scrollbar  bg-[#1a1a25] rounded  md:mr-3 md:mt-0  h-[260px]">
        <svg width="100%" height="48.8" viewBox="-10.6 -9.8 121.2 105.6" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.31074 87.2029 0.160416 86.8659C0.0100923 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0919944 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.408C17.5676 67.0306 18.0047 66.7295 18.4904 66.5234C18.9762 66.3172 19.5002 66.2104 20.0301 66.2095H99.0644C99.4415 66.2095 99.8104 66.3169 100.126 66.5183C100.441 66.7198 100.689 67.0067 100.84 67.3436C100.99 67.6806 101.036 68.0529 100.972 68.415C100.908 68.7771 100.737 69.1131 100.48 69.3817ZM83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2108 81.5055 33.1045 80.9743 33.1048H1.93563C1.55849 33.1048 1.18957 33.2121 0.874202 33.4136C0.558829 33.6151 0.31074 33.9019 0.160416 34.2388C0.0100923 34.5758 -0.0359181 34.9482 0.0280382 35.3103C0.0919944 35.6723 0.263131 36.0083 0.520422 36.277L17.2061 53.6968C17.5676 54.0742 18.0047 54.3752 18.4904 54.5814C18.9762 54.7875 19.5002 54.8944 20.0301 54.8952H99.0644C99.4415 54.8952 99.8104 54.7879 100.126 54.5864C100.441 54.3849 100.689 54.0981 100.84 53.7612C100.99 53.4242 101.036 53.0518 100.972 52.6897C100.908 52.3277 100.737 51.9917 100.48 51.723L83.8068 34.3032ZM1.93563 21.7905H80.9743C81.5055 21.7907 82.0312 21.6845 82.5185 21.4783C83.0058 21.2721 83.4444 20.9704 83.8068 20.592L100.48 3.17219C100.737 2.90357 100.908 2.56758 100.972 2.2055C101.036 1.84342 100.99 1.47103 100.84 1.13408C100.689 0.79713 100.441 0.510296 100.126 0.308823C99.8104 0.107349 99.4415 1.24074e-05 99.0644 0L20.0301 0C19.5002 0.000878397 18.9762 0.107699 18.4904 0.313848C18.0047 0.519998 17.5676 0.821087 17.2061 1.19848L0.524723 18.6183C0.267681 18.8866 0.0966198 19.2223 0.0325185 19.5839C-0.0315829 19.9456 0.0140624 20.3177 0.163856 20.6545C0.31365 20.9913 0.561081 21.2781 0.875804 21.4799C1.19053 21.6817 1.55886 21.7896 1.93563 21.7905Z" fill="#22c55e" />
</svg>


        Non-Custodial</div>
        </animated.div>
        <animated.div ref={ref4} style={props4} className="md:w-1/3 w-[70%] min-w-[240px] h-[260px] md:mt-0 mt-12 relative">
  <FaPlay className="text-green-500 text-[4rem] absolute top-[-2rem] left-1/2 transform -translate-x-1/2" />
  <div className="flex flex-col justify-center items-center custom-scrollbar h-[260px] bg-[#1a1a25] rounded md:ml-3 md:mr-3 ">
    Gamified
  </div>
</animated.div>



        <animated.div ref={ref5} style={props5} className="md:w-1/3 w-[70%] min-w-[240px] h-[260px]  md:mt-0 mt-12">
        <FaUserCheck className="text-green-500 text-[4rem] absolute top-[-2rem] left-1/2 transform -translate-x-1/2" />
        <div className="flex flex-col justify-center items-center custom-scrollbar h-[260px] bg-[#1a1a25] rounded  md:ml-3 md:mt-0">
        <div >
        User Friendly</div></div>
        </animated.div>


        </div>
        </div>
        </div>


        <div className="flex justify-center items-center">
        <div className="w-[98%] md:w-[80%] md:h-[260px] bg-transparent md:mt-6 rounded  ">
        <div className="flex md:flex-row flex-col justify-center items-center overflow-x-hidden">
        <animated.div ref={ref6} style={props6} className="md:w-1/3 w-[70%] min-w-[240px] h-[260px] mt-12">
        <FaWallet className="text-green-500 text-[4rem] absolute top-[-2rem] left-1/2 transform -translate-x-1/2" />
        <div className="flex flex-col justify-center items-center  h-[260px] bg-[#1a1a25] rounded   md:mr-3 ">
        </div>        </animated.div>
        <animated.div ref={ref7} style={props7} className="md:w-1/3 w-[70%] min-w-[240px] h-[260px] mt-12">
        <FaShield className="text-green-500 text-[4rem] absolute top-[-2rem] left-1/2 transform -translate-x-1/2" />
        <div className="flex flex-col justify-center items-center h-[260px] bg-[#1a1a25] rounded  md:ml-3 md:mr-3 ">
       </div></animated.div>
        <animated.div ref={ref8} style={props8} className="md:w-1/3 w-[70%] min-w-[240px] h-[260px] mt-12">
        <FaShield className="text-green-500 text-[4rem] absolute top-[-2rem] left-1/2 transform -translate-x-1/2" />
        <div className="flex flex-col justify-center items-center h-[260px] bg-[#1a1a25] rounded  md:ml-3">
       </div></animated.div>

        </div>
        </div>
        </div>

        <animated.div ref={ref9} style={props9}>
        <h2 className="text-center text-3xl ml-2 mt-24 font-bold text-transparent bg-clip-text bg-slate-300">
            Join our Community
        </h2>
        <div className="flex justify-center items-center">
        <div className="custom-scrollbar w-[98%] md:w-[80%] h-[260px] bg-[#1a1a25] mt-2 rounded mb-8">
        <div className="flex justify-center items-center">
        <div className="flex justify-center items-center" style={{ backgroundImage: `url(/Comm.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

        <div className=" w-[74%] h-[260px] sm:flex-col flex flex-col justify-center items-center text-center text-2xl md:text-3xl text-slate-300  bg-transparent rounded">
        Choose your direction now and join our community of traders.
        <div className="flex md:pt-4 pt-0 sm:flex-row flex-col justify-center items-center">

        <div className="w-[200px] sm:mr-2 mr-0 text-center text-xl mt-4 font-bold text-[#1a1a25] bg-green-500 rounded-full hover:bg-green-500 hover:text-[#1a1a25] transform hover:scale-110 shadow component">
          <Link href="/trade">
            <button className="mt-1 mb-2">Start Trading</button>
          </Link>
      </div>
      
      <div className="w-[200px] sm:ml-2 ml-0 sm:mb-0 mb-2 text-center text-xl mt-4 font-bold text-[#1a1a25] bg-[#7289da] rounded-full hover:bg-[#7289da] hover:text-[#1a1a25] transform hover:scale-110 shadow component">
          <Link href="/trade">
            <button className="mt-1 mb-2">Discord</button>
          </Link>
      </div></div></div>
</div>
        </div>
        </div>
        </div>
        </animated.div>
        </div>
        
        </div>
  );
}
