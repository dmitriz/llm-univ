describe('getRecommendedTier', () => {
    it('should recommend appropriate tier based on requirements', () => {
      const requirements = { rpm: 100, tpm: 50000 };
      const tier = getRecommendedTier('openai', requirements);
      expect(tier).toBeDefined();
      expect(typeof tier).toBe('string');
    });

    it('should handle unknown providers', () => {
      const tier = getRecommendedTier('unknown-provider', { rpm: 100 });
      expect(tier).toBe('unknown');
  });
});
