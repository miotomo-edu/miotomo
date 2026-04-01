import "./index.css";
import { Composition } from "remotion";
import { MiotomoPitch } from "./MiotomoPitch";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MiotomoPitch"
        component={MiotomoPitch}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
