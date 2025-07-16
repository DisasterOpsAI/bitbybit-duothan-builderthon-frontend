import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Hello World!</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to your Next.js app with shadcn/ui
        </p>
        <Button>Click me!</Button>
      </div>
    </div>
  );
}
