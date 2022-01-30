---
title: "Arrays"
date: 2022-01-26T08:59:03-07:00
draft: true
---

## What is an Array?

### Arrays are reference types

- Arrays store the reference to the data and not the data its self

```java
public class YourNameHere {

  public static void main(String[] args) {
    int[] a = { 1, 2, 3 };
    System.out.println("a[1] = " + a[1]);
    // a[1] = 2

    int[] b = a;
    b[1] = 99;

    System.out.println("a[1] = " + a[1]);
    // a[1] = 99
  }
}

```

## Types of Arrays

### One Dimensional Arrays

- 1D arrays are like lists

### Two Dimensional Arrays

- 2D arrays are like grids
- It's also an Array of Arrays
- Each Array can have its own size

  ```java
  //Array Declaration
  <datatype>[][] <array_name>;
  double[][] hightemps;

  //Array Instantiation
  new <data_type>[<size1>][<size2>];
  new double[12][31];

  //Array Declaration with Instantiation
  double[][] highTemps = new double [12][31];
  int[][] values = {{1,2}, {3,4}, {5,6}};
  ```

### N Dimensional Arrays

- I mean you techniclly can but like why

## Array Examples

### Getting Largest Value

```java
class Main{
    public static vodid main(String [] args){
        int[][] myArray = get2DArray();

        printArray(myArray);

        int x = getLargest2D(myArray);
        System.out.println("x = " + x);
    }

    static int getLargest2D(int[][] arr2d) {

        int largest = Integer.MIN_VALUE;

        for (int rowIndex = 0; rowIndex < arr2d.length; rowIndex++){
            int[] row = arr2d[rowIndex]

            for (int colIndex = 0; colIndex < row.length; colIndex++){

                if (value > largest){

                    largest = value;
                }
            }
        }
        return largest;
    }

    static int[][] get2DArray() {
        int size1 = rnd(5, 10);
        int size2 = rnd(5, 10);
        int[][] array = new int[size1][size2];

        for (int index1 = 0; index1 < size1; index1++) {
            for (int index2 = 0; index2 < size2; index2++) {
                array[index1][index2] = rnd(1, 100);
            }
        }

        return array;
    }

    static int rnd(int min, int max) {
        return (int)(Math.random() * (max - min) + min);
    }

}

```

### Adding the Largest of Each Row

```java
Class Main{
    public static void main(String [] args){

        int[][] myArray = get2DArray();
        printArray(myArray);

        int x = sumOfLargestInEachRow(myArray);
        System.out.println("x = " + x);

    }

    static int sumOfLargestInEachRow(int[][] arr2d){
        int sum = 0;

        for (int[] arr : arr2d){

            int max = largest(arr);
            sum += max;
        }

        return sum;
    }

    static int largest(int[] arr){
        int biggest = Integer.MIN_VALUE;

        for(x : arr){

            if (x > biggest){
                biggest = x;
            }
        }
        return biggest;
    }

    static int[][] get2DArray() {
        int size1 = rnd(5, 10);
        int size2 = rnd(5, 10);
        int[][] array = new int[size1][size2];

        for (int index1 = 0; index1 < size1; index1++) {
            for (int index2 = 0; index2 < size2; index2++) {
                array[index1][index2] = rnd(1, 100);
            }
        }

        return array;
    }

    static int rnd(int min, int max) {
        return (int)(Math.random() * (max - min) + min);
    }
}

```
