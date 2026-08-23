import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(17);
// Config.setChromiumOpenGlRenderer("swangle"); // removed: second worker page froze with swangle on this 2-core box
Config.setConcurrency(1);
Config.setDelayRenderTimeoutInMilliseconds(120000);
