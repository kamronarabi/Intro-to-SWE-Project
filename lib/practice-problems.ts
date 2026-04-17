import { type PracticeProblem } from "@/components/practice-problem-card";

export const practiceProblems: PracticeProblem[] = [
  // Easy Problems
  {
    id: "1",
    title: "Two Sum",
    description: "Find two numbers that add up to a target",
    difficulty: "Easy",
    language: "JavaScript",
    xp_reward: 100,
    problem_statement: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: `Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]`,
  },
  {
    id: "2",
    title: "Reverse String",
    description: "Reverse a string in-place",
    difficulty: "Easy",
    language: "Python",
    xp_reward: 80,
    problem_statement: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    examples: `Example 1:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]

Example 2:
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]`,
  },
  {
    id: "3",
    title: "Valid Palindrome",
    description: "Check if a string is a palindrome",
    difficulty: "Easy",
    language: "JavaScript",
    xp_reward: 100,
    problem_statement: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Alphanumeric characters include letters and numbers.

Given a string s, return true if it is a palindrome, or false otherwise.`,
    examples: `Example 1:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.

Example 2:
Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.`,
  },
  {
    id: "4",
    title: "Merge Sorted Array",
    description: "Merge two sorted arrays into one",
    difficulty: "Easy",
    language: "TypeScript",
    xp_reward: 90,
    problem_statement: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of valid elements in nums1 and nums2 respectively.

Merge nums2 into nums1 as one sorted array. You must modify nums1 in-place.`,
    examples: `Example 1:
Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
Output: [1,2,2,3,5,6]

Example 2:
Input: nums1 = [1], m = 1, nums2 = [], n = 0
Output: [1]`,
  },
  {
    id: "11",
    title: "Contains Duplicate",
    description: "Check if array contains duplicates",
    difficulty: "Easy",
    language: "JavaScript",
    xp_reward: 85,
    problem_statement: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.`,
    examples: `Example 1:
Input: nums = [1,2,3,1]
Output: true

Example 2:
Input: nums = [1,2,3,4]
Output: false

Example 3:
Input: nums = [99,99]
Output: true`,
  },
  {
    id: "12",
    title: "Best Time to Buy and Sell Stock",
    description: "Maximize profit from buying and selling stock",
    difficulty: "Easy",
    language: "Python",
    xp_reward: 95,
    problem_statement: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    examples: `Example 1:
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.

Example 2:
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.`,
  },
  {
    id: "13",
    title: "Valid Anagram",
    description: "Check if two strings are anagrams",
    difficulty: "Easy",
    language: "TypeScript",
    xp_reward: 90,
    problem_statement: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: `Example 1:
Input: s = "anagram", t = "nagaram"
Output: true

Example 2:
Input: s = "rat", t = "car"
Output: false`,
  },

  // Medium Problems
  {
    id: "5",
    title: "Binary Search",
    description: "Find target in a sorted array",
    difficulty: "Medium",
    language: "Python",
    xp_reward: 150,
    problem_statement: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.

If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
    examples: `Example 1:
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4

Example 2:
Input: nums = [-1,0,3,5,9,12], target = 13
Output: -1
Explanation: 13 does not exist in nums so return -1`,
  },
  {
    id: "6",
    title: "Maximum Subarray",
    description: "Find contiguous subarray with largest sum",
    difficulty: "Medium",
    language: "JavaScript",
    xp_reward: 150,
    problem_statement: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: `Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.

Example 2:
Input: nums = [5]
Output: 5

Example 3:
Input: nums = [-2,-1]
Output: -1`,
  },
  {
    id: "14",
    title: "Longest Substring Without Repeating Characters",
    description: "Find longest substring with unique characters",
    difficulty: "Medium",
    language: "JavaScript",
    xp_reward: 160,
    problem_statement: `Given a string s, find the length of the longest substring without repeating characters.`,
    examples: `Example 1:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

Example 2:
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

Example 3:
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.`,
  },
  {
    id: "15",
    title: "Group Anagrams",
    description: "Group words by anagram",
    difficulty: "Medium",
    language: "Python",
    xp_reward: 170,
    problem_statement: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: `Example 1:
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

Example 2:
Input: strs = [""]
Output: [[""]]

Example 3:
Input: strs = ["a"]
Output: [["a"]]`,
  },
  {
    id: "16",
    title: "Top K Frequent Elements",
    description: "Find K most frequent elements",
    difficulty: "Medium",
    language: "TypeScript",
    xp_reward: 175,
    problem_statement: `Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.`,
    examples: `Example 1:
Input: nums = [1,1,1,2,2,3], k = 2
Output: [1,2]

Example 2:
Input: nums = [1], k = 1
Output: [1]`,
  },

  // Hard Problems
  {
    id: "7",
    title: "LRU Cache",
    description: "Design and implement an LRU cache",
    difficulty: "Hard",
    language: "TypeScript",
    xp_reward: 300,
    problem_statement: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
- int get(int key) Return the value of the key if the key exists, otherwise return -1.
- void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.

Both operations must run in O(1) average time complexity.`,
    examples: `Example:
Input: ["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
Output: [null, null, null, 1, null, -1, null, -1, 3, 4]`,
  },
  {
    id: "8",
    title: "Word Ladder",
    description: "Find shortest transformation sequence",
    difficulty: "Hard",
    language: "Python",
    xp_reward: 280,
    problem_statement: `A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that:

Every adjacent pair of words differs by a single letter.
Every si for 1 <= i <= k is in wordList. Note that beginWord does not need to be in wordList.
sk == endWord

Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.`,
  },
  {
    id: "9",
    title: "Trapping Rain Water",
    description: "Calculate trapped rainwater volume",
    difficulty: "Hard",
    language: "JavaScript",
    xp_reward: 320,
    problem_statement: `Given an elevation map represented by an array of bars where the array index is the bar position and the array value is the bar height, predict how much rainwater can be trapped after it rains.`,
    examples: `Example 1:
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are trapped.`,
  },
  {
    id: "10",
    title: "Regular Expression Matching",
    description: "Pattern matching with '.' and '*'",
    difficulty: "Hard",
    language: "TypeScript",
    xp_reward: 350,
    problem_statement: `Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:

'.' Matches any single character.​​​
'*' Matches zero or more of the preceding element.

The matching should cover the entire input string (not partial).`,
    examples: `Example 1:
Input: s = "aa", p = "a"
Output: false
Explanation: "a" does not match the entire string "aa".

Example 2:
Input: s = "aa", p = "a*"
Output: true
Explanation: '*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, "aa" matches.`,
  },
  {
    id: "17",
    title: "Median of Two Sorted Arrays",
    description: "Find median of two sorted arrays",
    difficulty: "Hard",
    language: "JavaScript",
    xp_reward: 330,
    problem_statement: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
    examples: `Example 1:
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.

Example 2:
Input: nums1 = [0,0], nums2 = [0,0]
Output: 0.00000`,
  },
  {
    id: "18",
    title: "Longest Palindromic Substring",
    description: "Find the longest palindrome in a string",
    difficulty: "Hard",
    language: "Python",
    xp_reward: 310,
    problem_statement: `Given a string s, return the longest palindromic substring in s.

A string is palindromic if it reads the same forward and backward.`,
    examples: `Example 1:
Input: s = "babad"
Output: "bab" or "aba"
Explanation: Both "bab" and "aba" are valid answers.

Example 2:
Input: s = "cbbd"
Output: "bb"`,
  },
  {
    id: "19",
    title: "Serialize and Deserialize Binary Tree",
    description: "Convert binary tree to/from string",
    difficulty: "Hard",
    language: "TypeScript",
    xp_reward: 340,
    problem_statement: `Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.`,
  },
  {
    id: "20",
    title: "Merge K Sorted Lists",
    description: "Merge multiple sorted linked lists",
    difficulty: "Hard",
    language: "JavaScript",
    xp_reward: 360,
    problem_statement: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.`,
    examples: `Example 1:
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,1,3,4,4,5,6]

Example 2:
Input: lists = []
Output: []

Example 3:
Input: lists = [[]]
Output: []`,
  },
];
