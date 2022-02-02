---
title: "Classes"
date: 2022-01-31T09:43:10-07:00
draft: true
---

## Classes and Objects

Classes and objects are like blueprints and describe the object and class and what they contain. Classes and objects can me instantiated N number of times. Classes in java are data types. Objects are instances of types.

- Class: Defines a type of object
- Object: an instance of a class

### Procedural Programming

Programs are collaborations of objects. Objects are packages of responsibilities.

- Two kinds of responsibiltiies
  - Things it knows
  - Things it does
- How do we realize these responsibilties
  - Things it knows: Varibles (a.k.a. attributes or fields)
  - Things it does: Methods (a.k.a. operations)

### Classes

#### Class header

```java
class <ClassName> {
      <class-body>
}
```

#### Class example

```java
class Pet {

  public int age = 0;
  public String name = "";

  public String toString() {
    return String.format("%s is %d years old.", this.name, this.age);
  }
}

```

#### UML

| Class Name                  |
| :-------------------------- |
| - age:int                   |
| - name:String               |
| --------------------        |
|+ pet()  |
| + getName():String          |
| + setname(name:String):void |
| + getAge():int              |
| + setAge(age:int):void      |
| + toString():String         |

"+" denotes public
"-" denotes private

#### Public vs Private

A public variable can be accessed from anywhere in the program. Private variables can only be accessed in the class where they were created.

#### Getters & Setters

```java
class Pet{
  private int age = 0;
  private String name = "";

  public String getName(){
    return this.name;
  }
  public void SetName(String newName){
    thos.name = newName;
  }
  public int getAge(){
    retrun this.age;
  }
  public void setAge(int newAge){
    if (newAge >= 0)
      this.age = newAge;
  }
  public String toString() {
    return String.format("%s is %d years old.", this.name, this.age);
  }
}
```

## Encapsulation

## Instantiation

a

## Instance Variables and Methods

a

## Access Modifiers

a

## Getters and Setters

a

## Constructors

Constructors are methods. Constructors have the same name as the class name. They also don't have any return type. Their sole purpose is to initalize a new object to a valid state. The state of an object is determined by the values of its instance variables. Therefore a constructor is meant to initialize the instance variables with valiud values.

```java
class Pet{
  private int age = 0;
  private String name = "";

  //default constructor
  public Pet(){
    age = 0;
    name = "";
  }

  // Parameterized Constructor
  public Pet(String initName, int initAge){
    setName(initName);
    setAge(initAge);
  }
  public String getName(){
    return this.name;
  }
  public void SetName(String newName){
    thos.name = newName;
  }
  public int getAge(){
    retrun this.age;
  }
  public void setAge(int newAge){
    if (newAge >= 0)
      this.age = newAge;
  }
  public String toString() {
    return String.format("%s is %d years old.", this.name, this.age);
  }
}
```

## Inheritance

a

## Overriding base class methods

a

## Polymorphism
