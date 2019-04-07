cmake_minimum_required(VERSION 3.13)

include("extern/ZPM")

zpm_defaults()

project(GoogleTestExample LANGUAGES CXX)

add_executable(Example main.cpp)
target_link_libraries(Example PRIVATE Zefiros-Software::GoogleTest)

add_test(NAME Example COMMAND Example)
