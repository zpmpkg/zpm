{{cmake.project}}

add_library({{cmake.project_name}} 
{{#each source}}
    "{{this}}"
{{/each}}
)

{{#if public.include}}
target_include_directories({{cmake.project_name}} SYSTEM PUBLIC 
    {{#each public.include}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if private.include}}
target_include_directories({{cmake.project_name}} SYSTEM PRIVATE 
    {{#each private.include}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if public.define}}
target_compile_definitions({{cmake.project_name}} PUBLIC 
    {{#each public.define}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#if private.define}}
target_compile_definitions({{cmake.project_name}} PRIVATE 
    {{#each rivate.define}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#if public.link}}
target_link_libraries({{cmake.project_name}} PUBLIC 
    {{#each public.link}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#if private.link}}
target_link_libraries({{cmake.project_name}} PRIVATE 
    {{#each private.link}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#if public.compile}}
target_compile_features({{cmake.project_name}} PUBLIC 
    {{#each public.compile}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#if private.compile}}
target_compile_features({{cmake.project_name}} PRIVATE 
    {{#each private.compile}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#custom}}
{{this}}

{{/custom~}}

{{cmake.target}}