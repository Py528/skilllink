// Basic test to verify Jest setup
describe('Basic Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const greeting = 'Hello, World!'
    expect(greeting).toContain('Hello')
    expect(greeting.length).toBeGreaterThan(0)
  })

  it('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
    expect(numbers.filter(n => n > 3)).toEqual([4, 5])
  })
})
