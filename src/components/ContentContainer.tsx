import { RequestAirdrop } from "./RequestAirdrop";
import Text from "./Text";
import NavElement from "./nav-element";
interface Props {
  children: React.ReactNode;
}

export const ContentContainer: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex-1 drawer min-h-[210px]">
      <input id="my-drawer" type="checkbox" className="grow drawer-toggle" />
      <div className="items-center drawer-content">{children}</div>
      {/* SideBar / Drawer */}
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay gap-6"></label>

        <ul className="p-4 menu w-80 bg-[#232332] gap-10 sm:flex items-center">
          <li>
            <Text
              variant="heading"
              className="font-extrabold tracking-tighter text-center text-transparent bg-clip-text bg-gradient-to-br from-[#9c3fee] to-[#ef4628] mt-10"
            >
              Menu
            </Text>
          </li>
          <li>
            <NavElement label="Home" href="/" />
          </li>
          <li>
            <NavElement label="Options" href="/trade" />
          </li>
          <li>
            <NavElement label="Futures" href="/futures" />
          </li>
          <li>
            <NavElement label="Stats" href="/stats" />
          </li>
          < RequestAirdrop/>
        </ul>
      </div>
    </div>
  );
};
