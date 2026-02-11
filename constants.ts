import { TestData, TestMetadata } from './types';
import module_1 from './tests/module_1.json'

export const TESTS: TestMetadata[] = [
  { id: '1', name: 'Module 1', fileName: 'module_1.json' },
];

export const MOCK_TEST_DATA: Record<string, TestData> = {
  'module_1.json': module_1 as TestData
};