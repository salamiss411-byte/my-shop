import { supabase } from "../lib/supabaseClient";

export default function TestSupabase() {
  const test = async () => {
    const { data, error } = await supabase.from("products").select("*");
    console.log(data, error);
  };

  return (
    <div>
      <h1>Test Supabase</h1>
      <button onClick={test}>Tester la connexion</button>
    </div>
  );
}
