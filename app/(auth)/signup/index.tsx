import AndroidLogin from "@/components/AndroidLogin";
import IosLogin from "@/components/IosLogin";
import { Platform } from "react-native";

export default (): JSX.Element =>
  Platform.OS === "android" ? <AndroidLogin /> : <IosLogin />;
