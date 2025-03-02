import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

export interface TestCase {
  name: string;
  fn: () => Promise<void> | void;
}

export class TestUtil {
  /**
   * Run tests with Node.js 20 Test Runner
   * @param testName Name of the test
   * @param testFn Test function
   */
  static async runTest(
    testName: string,
    testFn: () => Promise<void> | void,
  ): Promise<void> {
    await test(testName, async () => {
      try {
        await testFn();
      } catch (error) {
        if (error instanceof Error) {
          assert.fail(`Test failed: ${error.message}`);
        } else {
          assert.fail('Test failed with unknown error');
        }
      }
    });
  }

  /**
   * Run tests with cleanup
   * @param testName Name of the test
   * @param testFn Test function
   * @param cleanup Cleanup function
   */
  static async runTestWithCleanup(
    testName: string,
    testFn: () => Promise<void> | void,
    cleanup: () => Promise<void> | void,
  ): Promise<void> {
    await test(testName, async (t) => {
      try {
        t.after(async () => {
          await cleanup();
        });
        await testFn();
      } catch (error) {
        if (error instanceof Error) {
          assert.fail(`Test failed: ${error.message}`);
        } else {
          assert.fail('Test failed with unknown error');
        }
      }
    });
  }

  /**
   * Run multiple tests in parallel
   * @param tests Array of test objects
   */
  static async runParallelTests(tests: TestCase[]): Promise<void> {
    await describe('Parallel Tests', async () => {
      await Promise.all(tests.map(({ name, fn }) => this.runTest(name, fn)));
    });
  }
}
