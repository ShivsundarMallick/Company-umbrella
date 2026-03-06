import { MessageSquare } from "lucide-react";

const FloatingActionButton = () => {
  return (
    <button className="fixed bottom-28 right-4 bg-fab text-primary-foreground p-4 rounded-full shadow-lg hover:opacity-90 transition-opacity z-40">
      <MessageSquare className="h-6 w-6" />
    </button>
  );
};

export default FloatingActionButton;
