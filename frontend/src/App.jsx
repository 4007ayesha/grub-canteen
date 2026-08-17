import PageLayout from "./components/layout/PageLayout";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Card from "./components/ui/Card";
import "./App.css";

function App() {
  return (
    <PageLayout>
      <h1>Grub Canteen Design System</h1>
      <p>Reusable UI components for the Grub Canteen team.</p>

      <section className="demo-section">
        <h2>Buttons</h2>

        <div className="demo-row">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
        </div>
      </section>

      <section className="demo-section">
        <h2>Input</h2>

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
        />
      </section>

      <section className="demo-section">
        <h2>Card</h2>

        <Card>
          <h3>Veg Burger</h3>
          <p>Fresh vegetable burger</p>
          <strong>₹50</strong>
        </Card>
      </section>
    </PageLayout>
  );
}

export default App;