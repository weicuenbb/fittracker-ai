"use client";


import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Meal = {
  name: string;
  calories: number;
  protein:  number;
  carbs?: number;
  fat?: number;
  loggedAt: string;
  date: string;
};

export default function Home() {
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [weight, setWeight] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const [food, setFood] = useState("");
  const [mealEstimate, setMealEstimate] = useState<Meal | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}
  useEffect(() => {
    const savedWeight = localStorage.getItem("currentWeight");
    const savedHistory = localStorage.getItem("weightHistory");
    const savedMeals = localStorage.getItem("meals");

    if (savedWeight) setWeight(savedWeight);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedMeals) setMeals(JSON.parse(savedMeals));
  }, []);

  function saveWeight() {
  if (!weight) return;

  localStorage.setItem("currentWeight", weight);

  function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

const today = getTodayKey();
  const now = new Date().toLocaleString();

  const newEntry = `${now} - ${weight} kg`;

  const filteredHistory = history.filter((entry) => {
    const entryDateTime = entry.split(" - ")[0];
    const entryDate = entryDateTime.split(",")[0];

    return entryDate !== today;
  });

  const newHistory = [newEntry, ...filteredHistory];

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
  date: getTodayKey(),
});
  } catch (error) {
    alert("Something went wrong. Check the terminal.");
  }
}

  function saveMeal() {
  if (!mealEstimate) return;

  const mealWithDate = {
    ...mealEstimate,
    date: getTodayKey(),
    loggedAt: new Date().toLocaleString(),
  };

  const newMeals = [mealWithDate, ...meals];

  setMeals(newMeals);
  localStorage.setItem("meals", JSON.stringify(newMeals));

  setFood("");
  setMealEstimate(null);

  alert("Meal saved!");
}
function toggleDate(date: string) {
  if (expandedDates.includes(date)) {
    setExpandedDates(expandedDates.filter((d) => d !== date));
  } else {
    setExpandedDates([...expandedDates, date]);
  }
}
function deleteMeal(mealToDelete: Meal) {
  const updatedMeals = meals.filter((meal) => meal !== mealToDelete);

  setMeals(updatedMeals);
  localStorage.setItem("meals", JSON.stringify(updatedMeals));
}

 const today = getTodayKey();

const todaysMeals = meals.filter((meal) => meal.date === today);

const calorieGoal = 2100;
const proteinGoal = 160;
const carbsGoal = 200;
const fatGoal = 50;

const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
const totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0);
const totalCarbs = todaysMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
const totalFat = todaysMeals.reduce((sum, meal) => sum + (meal.fat || 0), 0);

const weightNumbers = history
  .map((entry) => {
    const match = entry.match(/- ([0-9.]+) kg/);
    return match ? Number(match[1]) : null;
  })
  .filter((weight): weight is number => weight !== null);

const currentWeight = weightNumbers[0] || 0;

const averageWeight =
  weightNumbers.length > 0
    ? weightNumbers.reduce((sum, weight) => sum + weight, 0) /
      weightNumbers.length
    : 0;

const startingWeight =
  weightNumbers.length > 0 ? weightNumbers[weightNumbers.length - 1] : 0;

const weightChange =
  currentWeight && startingWeight ? currentWeight - startingWeight : 0;
 const weightChartData = history
  .map((entry) => {
    const weightMatch = entry.match(/- ([0-9.]+) kg/);
    const dateTime = entry.split(" - ")[0];
    const dateOnly = dateTime.split(",")[0];

    return {
      date: dateOnly,
      weight: weightMatch ? Number(weightMatch[1]) : 0,
    };
  })
  .reverse();

function progress(value: number, goal: number) {
  return Math.min((value / goal) * 100, 100);
}
function ProgressBar({ value, goal }: { value: number; goal: number }) {
  return (
    <div className="mt-3">
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full"
          style={{ width: `${progress(value, goal)}%` }}
        />
      </div>
      <p className="text-zinc-500 text-xs mt-1">
        {Math.round(progress(value, goal))}% of goal
      </p>
    </div>
  );
}

const mealsByDate = meals.reduce((groups: Record<string, Meal[]>, meal) => {
  const date = meal.date || "Unknown date";

  if (!groups[date]) {
    groups[date] = [];
  }

  groups[date].push(meal);
  return groups;
}, {});

  return (
    <main className="min-h-screen bg-black text-white px-5 py-8">
      <div className="max-w-md mx-auto">
        <p className="text-zinc-500 text-sm mb-1">Today</p>

        <h1 className="text-4xl font-bold tracking-tight">
          Kai's FitTracker
        </h1>

        <p className="text-zinc-500 mb-8">
          Nutrition • Training • Progress
        </p>

      <div className="grid grid-cols-2 gap-4 mb-5">
  <div className="bg-zinc-900 rounded-[1.75rem] p-5">
    <p className="text-zinc-500 text-sm">Calories</p>
    <p className="text-3xl font-bold mt-2">{totalCalories}</p>
    <p className="text-zinc-500 text-sm">/ {calorieGoal} kcal</p>
    <ProgressBar value={totalCalories} goal={calorieGoal} />
  </div>

  <div className="bg-zinc-900 rounded-[1.75rem] p-5">
    <p className="text-zinc-500 text-sm">Protein</p>
    <p className="text-3xl font-bold mt-2">{totalProtein}g</p>
    <p className="text-zinc-500 text-sm">/ {proteinGoal}g</p>
    <ProgressBar value={totalProtein} goal={proteinGoal} />
  </div>

  <div className="bg-zinc-900 rounded-[1.75rem] p-5">
    <p className="text-zinc-500 text-sm">Carbs</p>
    <p className="text-3xl font-bold mt-2">{totalCarbs}g</p>
    <p className="text-zinc-500 text-sm">/ {carbsGoal}g</p>
    <ProgressBar value={totalCarbs} goal={carbsGoal} />
  </div>

  <div className="bg-zinc-900 rounded-[1.75rem] p-5">
    <p className="text-zinc-500 text-sm">Fat</p>
    <p className="text-3xl font-bold mt-2">{totalFat}g</p>
    <p className="text-zinc-500 text-sm">/ {fatGoal}g</p>
    <ProgressBar value={totalFat} goal={fatGoal} />
  </div>
</div>

        <div className="bg-white text-black rounded-[2rem] p-6 mb-5">
          <p className="text-zinc-500 text-sm mb-2">Meal Logger</p>

          <input
            type="text"
            placeholder="e.g. Chicken breast, rice, broccoli"
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
          <p className="text-zinc-500 text-sm mb-2">Weight</p>

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
  <h2 className="text-lg font-semibold mb-3">Meal History</h2>

  {Object.keys(mealsByDate).length === 0 ? (
    <p className="text-zinc-500">No meal history yet</p>
  ) : (
    <div className="space-y-4">
      {Object.entries(mealsByDate).map(([date, dateMeals]) => {
        const dateCalories = dateMeals.reduce(
          (sum, meal) => sum + meal.calories,
          0
        );

        const dateProtein = dateMeals.reduce(
          (sum, meal) => sum + meal.protein,
          0
        );
        const dateCarbs = dateMeals.reduce(
  (sum, meal) => sum + (meal.carbs || 0),
  0
);

const dateFat = dateMeals.reduce(
  (sum, meal) => sum + (meal.fat || 0),
  0
);

        return (
          <div key={date} className="bg-zinc-800 rounded-2xl p-4">
           <button
  onClick={() => toggleDate(date)}
  className="w-full text-left font-semibold flex justify-between items-center"
>
  <span>{date}</span>
  <span>
    {expandedDates.includes(date) ? "−" : "+"}
  </span>
</button>

            <p className="text-zinc-400 text-sm mb-3">
  {dateCalories} kcal •
  {dateProtein}P •
  {dateCarbs}C •
  {dateFat}F
</p>

            {expandedDates.includes(date) && (
  <div className="space-y-2">
    {dateMeals.map((meal, index) => (
      <div key={index} className="border-t border-zinc-700 pt-2">
        <p>{meal.name}</p>

        <p className="text-zinc-400 text-sm">
          {meal.calories} kcal • {meal.protein}g protein •{" "}
          {meal.carbs || 0}g carbs • {meal.fat || 0}g fat
        </p>

        <p className="text-zinc-500 text-xs">
          {meal.loggedAt}
        </p>

        <button
          onClick={() => deleteMeal(meal)}
          className="mt-2 text-red-400 text-sm"
        >
          Delete
        </button>
      </div>
    ))}
  </div>
)}
          </div>
        );
      })}
    </div>
  )}
</div>
<div className="bg-zinc-900 rounded-[1.75rem] p-5 mb-5">
  <h2 className="text-lg font-semibold mb-4">Weight Trend</h2>

  {weightNumbers.length === 0 ? (
    <p className="text-zinc-500">No weight trend yet</p>
  ) : (
    <>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div>
          <p className="text-zinc-500 text-xs">Current</p>
          <p className="text-xl font-bold">{currentWeight.toFixed(1)}kg</p>
        </div>

        <div>
          <p className="text-zinc-500 text-xs">Average</p>
          <p className="text-xl font-bold">{averageWeight.toFixed(1)}kg</p>
        </div>

        <div>
          <p className="text-zinc-500 text-xs">Change</p>
          <p className="text-xl font-bold">
            {weightChange > 0 ? "+" : ""}
            {weightChange.toFixed(1)}kg
          </p>
        </div>
      </div>

     <div className="h-56 mt-4">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={weightChartData}>
      <XAxis
        dataKey="date"
        tick={{ fill: "#a1a1aa", fontSize: 10 }}
        tickLine={false}
        axisLine={false}
      />
      <YAxis
  domain={[
    Math.floor(Math.min(...weightNumbers) - 1),
    Math.ceil(Math.max(...weightNumbers) + 1),
  ]}
  tick={{ fill: "#a1a1aa", fontSize: 10 }}
  tickLine={false}
  axisLine={false}
/>
      <Tooltip />
      <Line
        type="monotone"
        dataKey="weight"
        stroke="#ffffff"
        strokeWidth={3}
        dot={{ r: 4 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
    </>
  )}
</div>
        
        <button
  onClick={() => {
    localStorage.clear();
    location.reload();
  }}
  className="bg-red-500 text-white px-4 py-2 rounded-full text-sm mb-4"
>
  Clear All Data
</button> 
      </div>
      
    </main>
  );
}