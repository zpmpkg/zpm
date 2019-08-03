cmake_minimum_required(VERSION 3.13)

if(NOT ZPM_LOADED)
  include("extern/ZPM")

  zpm_defaults()
endif()

add_executable({{cmake.dir}}
{{#each source}}
    "{{this}}"
{{/each}}
)

{{#if private.link}}
target_link_libraries({{cmake.dir}} PRIVATE 
    {{#each private.link}}
    {{this}}
    {{/each}}
)

{{/if~}}

add_test(NAME {{cmake.dir}} COMMAND {{cmake.dir}})
