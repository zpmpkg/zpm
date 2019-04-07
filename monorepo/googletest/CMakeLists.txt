zpm_project()

add_library("${PROJECT_NAME}+gtest" "googletest/src/gtest-all.cc")

target_include_directories("${PROJECT_NAME}+gtest"
                           PUBLIC "googletest/include/"
                           PRIVATE "googletest/")

add_library("${PROJECT_NAME}+gmock" "googlemock/src/gmock-all.cc")

target_include_directories("${PROJECT_NAME}+gmock"
                           PUBLIC "googlemock/include/"
                           PRIVATE "googlemock/")

target_link_libraries("${PROJECT_NAME}+gmock" PUBLIC "${PROJECT_NAME}+gtest")

zpm_alias("${PROJECT_NAME}+gmock")
zpm_alias("${PROJECT_NAME}+gtest")
zpm_default_target("${PROJECT_NAME}+gmock")
