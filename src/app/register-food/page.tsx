"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const IMAGE_SIZE = 400;

type FoodItem = {
  name: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  category: string;
  imageUrl: string | null;
};

export default function RegisterFoodPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FoodItem>({
    name: "",
    description: "",
    ingredients: [],
    allergens: [],
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    category: "",
    imageUrl: null,
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ingredientInput, setIngredientInput] = useState("");
  const [allergenInput, setAllergenInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Main Course", "Appetizer", "Dessert", "Beverage", "Salad", 
    "Soup", "Sandwich", "Pizza", "Pasta", "Seafood", "Vegetarian", "Vegan"
  ];

  const commonAllergens = [
    "Gluten", "Dairy", "Eggs", "Nuts", "Peanuts", "Soy", "Fish", "Shellfish", "Sesame"
  ];

  function handleInputChange(field: keyof FoodItem, value: string | number) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function addIngredient() {
    if (ingredientInput.trim() && !formData.ingredients.includes(ingredientInput.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()]
      }));
      setIngredientInput("");
    }
  }

  function removeIngredient(ingredient: string) {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i !== ingredient)
    }));
  }

  function addAllergen(allergen: string) {
    if (!formData.allergens.includes(allergen)) {
      setFormData(prev => ({
        ...prev,
        allergens: [...prev.allergens, allergen]
      }));
    }
  }

  function removeAllergen(allergen: string) {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.filter(a => a !== allergen)
    }));
  }

  function addCustomAllergen() {
    if (allergenInput.trim() && !formData.allergens.includes(allergenInput.trim())) {
      addAllergen(allergenInput.trim());
      setAllergenInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("ingredients", JSON.stringify(formData.ingredients));
    submitData.append("allergens", JSON.stringify(formData.allergens));
    submitData.append("calories", formData.calories.toString());
    submitData.append("protein", formData.protein.toString());
    submitData.append("carbs", formData.carbs.toString());
    submitData.append("fat", formData.fat.toString());
    submitData.append("fiber", formData.fiber.toString());
    submitData.append("sugar", formData.sugar.toString());
    submitData.append("sodium", formData.sodium.toString());
    submitData.append("category", formData.category);
    if (image) submitData.append("image", image);

    try {
      const res = await fetch("/api/restaurant-offers/register-food", {
        method: "POST",
        body: submitData,
      });

      if (res.ok) {
        alert("Food item registered successfully!");
        router.push("/dashboard");
      } else {
        alert("Failed to register food item.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-4">
      <div className="max-w-4xl mx-auto bg-white/90 rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-green-700 hover:underline flex items-center gap-1 mb-4"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-green-700">Register Food Item</h1>
          <p className="text-gray-600 mt-2">Add a new food item to your menu database</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Food Image</label>
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-full h-64 border-2 border-dashed border-green-300 rounded-xl flex items-center justify-center bg-green-50 overflow-hidden"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Food preview"
                      width={IMAGE_SIZE}
                      height={IMAGE_SIZE}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center text-green-600">
                      <svg width="48" height="48" className="mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <path d="M12 16l4-4m0 0l-4-4m4 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p>Click to upload food image</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Food Name *</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder="e.g., Margherita Pizza"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">Category *</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 h-24 resize-none"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe this food item..."
              />
            </div>

            {/* Ingredients */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Ingredients</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  placeholder="Add ingredient..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Nutrition & Allergens */}
          <div className="space-y-6">
            {/* Nutrition Facts */}
            <div>
              <h3 className="font-semibold text-lg text-gray-700 mb-4">Nutrition Facts (per serving)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-600">Calories</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.calories}
                    onChange={(e) => handleInputChange("calories", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-600">Protein (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.protein}
                    onChange={(e) => handleInputChange("protein", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-600">Carbs (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.carbs}
                    onChange={(e) => handleInputChange("carbs", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-600">Fat (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.fat}
                    onChange={(e) => handleInputChange("fat", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-600">Fiber (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.fiber}
                    onChange={(e) => handleInputChange("fiber", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-600">Sugar (g)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.sugar}
                    onChange={(e) => handleInputChange("sugar", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-medium mb-1 text-gray-600">Sodium (mg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.sodium}
                    onChange={(e) => handleInputChange("sodium", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Allergens */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700">Allergens</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {commonAllergens.map((allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => 
                      formData.allergens.includes(allergen) 
                        ? removeAllergen(allergen) 
                        : addAllergen(allergen)
                    }
                    className={`px-3 py-2 rounded-lg text-sm transition ${
                      formData.allergens.includes(allergen)
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {allergen}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={allergenInput}
                  onChange={(e) => setAllergenInput(e.target.value)}
                  placeholder="Add custom allergen..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomAllergen())}
                />
                <button
                  type="button"
                  onClick={addCustomAllergen}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.allergens.map((allergen, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    ⚠️ {allergen}
                    <button
                      type="button"
                      onClick={() => removeAllergen(allergen)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.category}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registering..." : "Register Food Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}