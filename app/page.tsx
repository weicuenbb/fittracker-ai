"use client";

import { useEffect, useState } from "react";

type Meal = {
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  loggedAt: string;
};

export default function Home() {
  const [weight, setWeight] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const [food, setFood] = useState("");
  const [mealEstimate, setMealEstimate] = useState<Meal | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    const savedWeight = localStorage.getItem("currentWeight");
    const savedHistory = localStorage.getItem("weightHistory");
    const savedMeals = localStorage.getItem("meals");

    if (savedWeight) setWeight(savedWeight);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedMeals) setMeals(JSON.parse(savedMeals));
  }, []);

  function saveWeight() {
    localStorage.setItem("currentWeight", weight);

    const newHistory = [
      `${new Date().toLocaleString()} - ${weight} kg`,
      ...history,
    ];

    setHistory(newHistory);
    localStorage.setItem("weightHistory", JSON.stringify(newHistory));

    alert("Weight saved!");
  }

 async function estimateMeal() {
  if (!food) return;

  try {
    const response = await fetch("/api/estimate-meal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ food }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to estimate meal");
      return;
    }

    setMealEstimate({
  name: data.name,
  calories: data.calories,
  protein: data.protein,
  carbs: data.carbs,
  fat: data.fat,
  loggedAt: new Date().toLocaleString(),
});
  } catch (error) {
    alert("Something went wrong. Check the terminal.");
  }
}

  function saveMeal() {
    if (!mealEstimate) return;

    const newMeals = [mealEstimate, ...meals];

    setMeals(newMeals);
    localStorage.setItem("meals", JSON.stringify(newMeals));

    setFood("");
    setMealEstimate(null);

    alert("Meal saved!");
  }

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);

  return (
    <main className="min-h-screen bg-black text-white px-5 py-8">
      <div className="max-w-md mx-auto">
        <p className="text-zinc-500 text-sm mb-1">Today</p>

        <h1 className="text-4xl font-bold tracking-tight">
          FitTracker AI
        </h1>

        <p className="text-zinc-500 mb-8">
          Nutrition • Training • Progress
        </p>

      <div className="grid grid-cols-2 gap-4 mb-5">
  <div className="bg-zinc-900 rounded-[1.75rem] p-5">
    <p className="text-zinc-500 text-sm">Calories</p>
    <p className="text-3xl font-bold mt-2">{totalCalories}</p>
    <p className="text-zinc-500 text-sm">kcal today</p>
  </div>

  <div className="bg-zinc-900 rounded-[1.75rem] p-5">
    <p className="text-zinc-500 text-sm">Protein</p>
    <p className="text-3xl font-bold mt-2">{totalProtein}g</p>
    <p className="text-zinc-500 text-sm">target 140g</p>
  </div>

  <div className="bg-zinc-900 rounded-[1.75rem] p-5">
    <p className="text-zinc-500 text-sm">Carbs</p>
    <p className="text-3xl font-bold mt-2">
      {meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0)}g
    </p>
    <p className="text-zinc-500 text-sm">today</p>
  </div>

  <div className="bg-zinc-900 rounded-[1.75rem] p-5">
    <p className="text-zinc-500 text-sm">Fat</p>
    <p className="text-3xl font-bold mt-2">
      {meals.reduce((sum, meal) => sum + (meal.fat || 0), 0)}g
    </p>
    <p className="text-zinc-500 text-sm">today</p>
  </div>
</div>

        <div className="bg-white text-black rounded-[2rem] p-6 mb-5">
          <p className="text-zinc-500 text-sm mb-2">AI Meal Logger</p>

          <input
            type="text"
            placeholder="e.g. Thai basil chicken rice"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className="w-full text-2xl font-semibold outline-none placeholder:text-zinc-300"
          />

          <button
            onClick={estimateMeal}
            className="mt-5 w-full bg-black text-white rounded-full py-3 font-semibold"
          >
            Estimate Macros
          </button>

          {mealEstimate && (
            <div className="mt-5 bg-zinc-100 rounded-2xl p-4">
              <p className="font-semibold">{mealEstimate.name}</p>
              <p className="text-zinc-600 mt-1">
                {mealEstimate.calories} kcal • {mealEstimate.protein}g protein
              </p>

              <button
                onClick={saveMeal}
                className="mt-4 w-full bg-black text-white rounded-full py-3 font-semibold"
              >
                Save Meal
              </button>
            </div>
          )}
        </div>

        <div className="bg-white text-black rounded-[2rem] p-6 mb-5">
          <p className="text-zinc-500 text-sm mb-2">Morning Weight</p>

          <input
            type="number"
            placeholder="Enter kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full text-5xl font-bold outline-none"
          />

          <button
            onClick={saveWeight}
            className="mt-5 w-full bg-black text-white rounded-full py-3 font-semibold"
          >
            Save Weight
          </button>
        </div>

        <div className="bg-zinc-900 rounded-[1.75rem] p-5 mb-5">
          <h2 className="text-lg font-semibold mb-3">Meals Today</h2>

          {meals.length === 0 ? (
            <p className="text-zinc-500">No meals logged yet</p>
          ) : (
            <div className="space-y-2">
              {meals.map((meal, index) => (
                <div key={index} className="bg-zinc-800 rounded-lg p-3">
                  <p>{meal.name}</p>
                  <p className="text-zinc-400 text-sm">
  {meal.calories} kcal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
</p>

<p className="text-zinc-500 text-xs mt-1">
  Logged at {meal.loggedAt}
</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 rounded-[1.75rem] p-5">
          <h2 className="text-lg font-semibold mb-3">Weight History</h2>

          {history.length === 0 ? (
            <p className="text-zinc-500">No weights logged yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((entry, index) => (
                <div key={index} className="bg-zinc-800 rounded-lg p-3">
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}