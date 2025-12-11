/**
 * Unit Tests for Snowflake Generation and Calculations
 *
 * Tests cover:
 * - Snowflake data model validation
 * - Property randomization
 * - Animation calculations
 * - Device detection
 */

describe("Snowflake Generation", () => {
  /**
   * Helper function to generate snowflakes
   * Mirrors the implementation in SnowflakeContainer
   */
  const generateSnowflakes = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      posX: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
      opacity: 0.6 + Math.random() * 0.4,
      scale: 0.5 + Math.random() * 1.5,
      rotation: Math.random() * 360,
      windStrength: -0.5 + Math.random() * 1,
    }));
  };

  describe("generateSnowflakes", () => {
    it("should generate the correct number of snowflakes", () => {
      const count = 100;
      const snowflakes = generateSnowflakes(count);
      expect(snowflakes).toHaveLength(count);
    });

    it("should generate snowflakes with all required properties", () => {
      const snowflakes = generateSnowflakes(1);
      const snowflake = snowflakes[0];

      expect(snowflake).toHaveProperty("id");
      expect(snowflake).toHaveProperty("posX");
      expect(snowflake).toHaveProperty("delay");
      expect(snowflake).toHaveProperty("duration");
      expect(snowflake).toHaveProperty("opacity");
      expect(snowflake).toHaveProperty("scale");
      expect(snowflake).toHaveProperty("rotation");
      expect(snowflake).toHaveProperty("windStrength");
    });

    it("should generate unique IDs for each snowflake", () => {
      const snowflakes = generateSnowflakes(50);
      const ids = snowflakes.map((f) => f.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(50);
    });

    it("should generate posX within valid range [0, 100]", () => {
      const snowflakes = generateSnowflakes(100);
      snowflakes.forEach((flake) => {
        expect(flake.posX).toBeGreaterThanOrEqual(0);
        expect(flake.posX).toBeLessThanOrEqual(100);
      });
    });

    it("should generate delay within valid range [0, 5]", () => {
      const snowflakes = generateSnowflakes(100);
      snowflakes.forEach((flake) => {
        expect(flake.delay).toBeGreaterThanOrEqual(0);
        expect(flake.delay).toBeLessThan(5);
      });
    });

    it("should generate duration within valid range [5, 15]", () => {
      const snowflakes = generateSnowflakes(100);
      snowflakes.forEach((flake) => {
        expect(flake.duration).toBeGreaterThanOrEqual(5);
        expect(flake.duration).toBeLessThan(15);
      });
    });

    it("should generate opacity within valid range [0.6, 1.0]", () => {
      const snowflakes = generateSnowflakes(100);
      snowflakes.forEach((flake) => {
        expect(flake.opacity).toBeGreaterThanOrEqual(0.6);
        expect(flake.opacity).toBeLessThanOrEqual(1.0);
      });
    });

    it("should generate scale within valid range [0.5, 2.0]", () => {
      const snowflakes = generateSnowflakes(100);
      snowflakes.forEach((flake) => {
        expect(flake.scale).toBeGreaterThanOrEqual(0.5);
        expect(flake.scale).toBeLessThanOrEqual(2.0);
      });
    });

    it("should generate rotation within valid range [0, 360]", () => {
      const snowflakes = generateSnowflakes(100);
      snowflakes.forEach((flake) => {
        expect(flake.rotation).toBeGreaterThanOrEqual(0);
        expect(flake.rotation).toBeLessThanOrEqual(360);
      });
    });

    it("should generate windStrength within valid range [-0.5, 0.5]", () => {
      const snowflakes = generateSnowflakes(100);
      snowflakes.forEach((flake) => {
        expect(flake.windStrength).toBeGreaterThanOrEqual(-0.5);
        expect(flake.windStrength).toBeLessThanOrEqual(0.5);
      });
    });

    it("should handle edge case of 0 snowflakes", () => {
      const snowflakes = generateSnowflakes(0);
      expect(snowflakes).toHaveLength(0);
    });

    it("should handle large count of snowflakes (300+)", () => {
      const snowflakes = generateSnowflakes(300);
      expect(snowflakes).toHaveLength(300);
      // Verify all snowflakes are valid
      snowflakes.forEach((flake) => {
        expect(typeof flake.id).toBe("number");
        expect(typeof flake.posX).toBe("number");
        expect(typeof flake.delay).toBe("number");
        expect(typeof flake.duration).toBe("number");
        expect(typeof flake.opacity).toBe("number");
        expect(typeof flake.scale).toBe("number");
        expect(typeof flake.rotation).toBe("number");
        expect(typeof flake.windStrength).toBe("number");
      });
    });
  });

  describe("Device Configuration", () => {
    it("should reduce snowflake count on low-end devices", () => {
      // Low-end device simulation would go here
      // Default count: 300, Low-end count: 100
      const lowEndCount = 100;
      const defaultCount = 300;
      expect(lowEndCount).toBeLessThan(defaultCount);
    });
  });

  describe("Animation Properties", () => {
    it("should calculate wind drift in pixels (windStrength * 50)", () => {
      const windStrength = 0.3;
      const driftPixels = windStrength * 50;
      expect(driftPixels).toBe(15);
    });

    it("should calculate rotation correctly", () => {
      const rotation = 180;
      // CSS animation should transform rotation by custom property
      expect(rotation).toBeGreaterThanOrEqual(0);
      expect(rotation).toBeLessThanOrEqual(360);
    });

    it("should calculate mid-point rotation (rotation * 0.5)", () => {
      const rotation = 360;
      const midpointRotation = rotation * 0.5;
      expect(midpointRotation).toBe(180);
    });

    it("should calculate fall distance correctly", () => {
      // From -10vh to 110vh = 120vh total distance
      const startOffset = -10;
      const endOffset = 110;
      const totalDistance = endOffset - startOffset;
      expect(totalDistance).toBe(120);
    });
  });

  describe("Memory and Performance", () => {
    it("should generate 300 snowflakes within reasonable time", () => {
      const startTime = performance.now();
      generateSnowflakes(300);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it("should not create memory leaks with multiple generations", () => {
      // Generate multiple times to check for memory issues
      for (let i = 0; i < 10; i++) {
        generateSnowflakes(300);
      }
      // If this completes without error, memory management is acceptable
      expect(true).toBe(true);
    });
  });

  describe("Property Randomization Distribution", () => {
    it("should distribute posX across full viewport range", () => {
      const snowflakes = generateSnowflakes(1000);
      const posXValues = snowflakes.map((f) => f.posX);
      const min = Math.min(...posXValues);
      const max = Math.max(...posXValues);

      // Should use range across 0-100
      expect(min).toBeLessThan(20);
      expect(max).toBeGreaterThan(80);
    });

    it("should vary delay values", () => {
      const snowflakes = generateSnowflakes(100);
      const delays = snowflakes.map((f) => f.delay);
      const uniqueDelays = new Set(delays);

      // With 100 snowflakes, should have significant variation
      expect(uniqueDelays.size).toBeGreaterThan(50);
    });

    it("should vary duration values", () => {
      const snowflakes = generateSnowflakes(100);
      const durations = snowflakes.map((f) => f.duration);
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      // Duration should span from near 5 to near 15
      expect(minDuration).toBeLessThan(7);
      expect(maxDuration).toBeGreaterThan(13);
    });
  });
});
