import { describe, it, expect } from "vitest";
import {
  calculateMoodDistribution,
  calculateSatisfactionIndex,
  calculateTopReasons,
  getRiskLevelFromMood,
} from "@/lib/analytics";

describe("Analytics Utils", () => {
  describe("calculateMoodDistribution", () => {
    it("should calculate mood distribution correctly", () => {
      const responses = [
        { mood: "Yaxşı" },
        { mood: "Yaxşı" },
        { mood: "Normal" },
        { mood: "Pis" },
      ] as any[];

      const result = calculateMoodDistribution(responses);

      expect(result).toHaveLength(3);
      expect(result.find((r) => r.mood === "Yaxşı")?.count).toBe(2);
      expect(result.find((r) => r.mood === "Normal")?.count).toBe(1);
      expect(result.find((r) => r.mood === "Pis")?.count).toBe(1);
    });

    it("should handle empty array", () => {
      const result = calculateMoodDistribution([]);
      expect(result).toHaveLength(3);
      result.forEach((r) => expect(r.count).toBe(0));
    });
  });

  describe("calculateSatisfactionIndex", () => {
    it("should calculate satisfaction index correctly", () => {
      const responses = [
        { mood: "Yaxşı" },
        { mood: "Yaxşı" },
        { mood: "Normal" },
        { mood: "Pis" },
      ] as any[];

      const result = calculateSatisfactionIndex(responses);
      // (2*100 + 1*50 + 1*0) / 4 = 250 / 4 = 62.5 → 63
      expect(result).toBe(63);
    });

    it("should return 0 for empty array", () => {
      expect(calculateSatisfactionIndex([])).toBe(0);
    });
  });

  describe("calculateTopReasons", () => {
    it("should return top reasons sorted by count", () => {
      const responses = [
        { reason_category: "İş yükü" },
        { reason_category: "İş yükü" },
        { reason_category: "İş yükü" },
        { reason_category: "Qrafik" },
        { reason_category: "Qrafik" },
        { reason_category: "Menecer" },
      ] as any[];

      const result = calculateTopReasons(responses);

      expect(result).toHaveLength(3);
      expect(result[0].reason).toBe("İş yükü");
      expect(result[0].count).toBe(3);
      expect(result[1].reason).toBe("Qrafik");
      expect(result[2].reason).toBe("Menecer");
    });
  });

  describe("getRiskLevelFromMood", () => {
    it("should return correct risk level for each mood", () => {
      // MOOD_SCORES: Əla=100, Yaxşı=75, Normal=50, Pis=25, Çox pis=0
      // getRiskLevelFromMood: >=75='low', >=50='medium', >=25='high', else='critical'
      expect(getRiskLevelFromMood("Əla")).toBe("low");      // 100 >= 75
      expect(getRiskLevelFromMood("Yaxşı")).toBe("low");   // 75 >= 75
      expect(getRiskLevelFromMood("Normal")).toBe("medium"); // 50 >= 50
      expect(getRiskLevelFromMood("Pis")).toBe("high");     // 25 >= 25
    });
  });
});
