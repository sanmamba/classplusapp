import { TestData, TestMetadata } from './types';
import testing123 from './tests/testing123.json'
import module_2 from './tests/module_2.json'

export const TESTS: TestMetadata[] = [
  { id: '1', name: 'Testing 123', fileName: 'testing123.json' },
  { id: '2', name: 'Module 2', fileName: 'module_2.json' }
];

export const MOCK_TEST_DATA: Record<string, TestData> = {
  'testing123.json': testing123 as TestData,
  'module_2.json': module_2 as TestData
};