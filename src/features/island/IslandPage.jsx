import IslandWorld from "./components/IslandWorld";
import HakoGuide from "@/features/hako/components/HakoGuide";

function IslandPage() {
  return (
    <div className="container">
      <h1>Warm Isle</h1>
      <p>在情緒的海上，有座懂你的島。</p>

      <HakoGuide />

      <IslandWorld />
    </div>
  );
}

export default IslandPage;
