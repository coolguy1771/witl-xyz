---
title: "Array Lists"
date: 2022-01-26T09:39:46-07:00
draft: false
---

## What is an ArrayList

- Dymanic Array
  - Can grow and shrink as needed
- Can only store non-primitive types
  - Primitive type equivalent Wrapper types
- Generics

| Primitive Data Type | Wrapper Class |
| :-----------------: | :-----------: |
|        byte         |     Byte      |
|        short        |     Short     |
|         int         |    Integer    |
|        long         |     Long      |
|        float        |     Float     |
|       double        |    Double     |
|       boolean       |    Boolean    |
|        char         |   Character   |

## Using ArrayLists

```java
//Declaration
ArrayList<data_type> <list_name>
ArrayList<Double> highTemps;

//Instantiation
new ArrayList<data_type>();
new ArrayList<Double>();

//Declaration With Instantiation

ArrayList<Double> highTemps = new ArrayList<Double>();
```

### ArrayList Methods

| Method                             | Method Desc                                                                                       |
| :--------------------------------- | :------------------------------------------------------------------------------------------------ |
| `add(E e)`                         | Adds given element e to the end of the list.                                                      |
| `add(int index, E element)`        | Adds given element ‘element’ at the specified position ‘index’.                                   |
| `clear()`                          | Clears the list by removing all the elements from the list.                                       |
| `contains(Object o)`               | Checks if the list contains the given element ‘o’. Returns true if the element is present.        |
| `ensureCapacity (int minCapacity)` | Increases the capacity of the ArrayList to ensure it has the minCapacity.                         |
| `get(int index)`                   | Returns the element in the list present at the position specified by ‘index’.                     |
| `indexOf(Object o)`                | Returns the element in the list present at the position specified by ‘index’.                     |
| `isEmpty()`                        | Checks if the given list is empty.                                                                |
| `lastIndexOf(Object o)`            | Returns the index of last occurrence of specified element in list. -1 if not present in the list. |
| `remove(int index)`                | Deletes element at the ‘index’ in the ArrayList.                                                  |
| `remove(Object o)`                 | Deletes the first occurrence of element o from the list.                                          |
| `set(int index, E element)`        | Sets the element value at given ‘index’ to the new value given by ‘element’.                      |
| `size()`                           | Returns the total number of elements or length of the list.                                       |
| `toArray()`                        | Converts the given list into an array.                                                            |
| `trimToSize()`                     | Trims the ArrayList capacity to the size or number of elements present in the list.               |

## ArrayList examples

### Average of an ArrayList

```java
import java.util.ArrayList;

class Main{

    public static void main(String [] args){

        ArrayList<Integer> myList = getArrayList();
        System.out.pringln("Hello World!")
    }

    static double getAverage(ArrayList<Integer> list){

            double sum = 0;
            double average = 0.0;

            for (int value : list) {

                sum += value;
            }

            average = sum / list.size();
        }
        return average;
}
```

### Odd Minus Even

```java
import java.util.ArrayList;

class Main {

  public static void main(String[] args) {
    ArrayList<Integer> myList = getArrayList();
    System.out.println("Hello world!");
  }

  static int oddMinusEven(ArrayList<Integer> list) {
    int sumPfOdd = 0;
    int sumOfEven = 0;

    for (int value : list) {
      if (value % 2 == 0) sumOfEven += value; else sumOfOdd += value;
    }

    return sumOfOdd - sumOfEven;
  }
}

```

### Pairwise Sums

```java
import java.util.ArrayList;

Class Main {
  public static void main(String[] args) {

    ArrayList<Integer> myList = getArrayList();
    System.out.println("Hello world!");
  }

  static int pairwiseSum(ArrayList<Integer> list1, ArrayList<Integer> list2) {

    ArrayList<Integer> sums = new ArrayList<Integer>();

    for (int i = 0; i < list1.size(); i++) {

      int sum = list1.get(i)  + list2.get(i);

      sums.add(sum);
    }

    /*
    int index = 0;

    for(int value list1){
      int sum - value + list2.get(index);
      summs.add(sum);
      index++;
    }
    */

    return sums;

  }

}
```

### Getting values that appear in both lists

```java
import java.util.ArrayList;

class Main {
  public static void main(String[] args) {

    ArrayList<Integer> myList = getArrayList();
    System.out.println("Hello world!");
  }

  static int allInBoth(ArrayList<Integer> list1, ArrayList<Integer> list2) {

    ArrayList<Integer> result = new ArrayList<Integer>();

    for (value : list1) {

      if(list2.contains(value))
        result.add(value);
    }

    return result;

  }

}
```
