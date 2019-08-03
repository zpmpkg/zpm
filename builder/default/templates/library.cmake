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

{{#if public.feature}}
target_compile_features({{cmake.project_name}} PUBLIC 
    {{#each public.feature}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#if private.feature}}
target_compile_features({{cmake.project_name}} PRIVATE 
    {{#each private.feature}}
    {{this}}
    {{/each}}
)

{{/if~}}

{{#each public.conditions}}
if({{on}})
    
{{#if let.include}}
target_include_directories({{@root.cmake.project_name}} PUBLIC 
    {{#each let.include}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.define}}
target_compile_definitions({{@root.cmake.project_name}} PUBLIC 
    {{#each let.define}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.link}}
target_link_libraries({{@root.cmake.project_name}} PUBLIC 
    {{#each let.link}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.feature}}
target_compile_features({{@root.cmake.project_name}} PUBLIC 
    {{#each let.feature}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.option}}
target_compile_options({{@root.cmake.project_name}} PUBLIC 
    {{#each let.option}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.source}}
target_sources({{@root.cmake.project_name}} PUBLIC 
    {{#each let.source}}
    {{this}}
    {{/each}}
)
{{/if~}}

{{#if let.custom}}
{{this}}

{{/if~}}
    
endif()
{{/each~}}

{{#each private.conditions}}
if({{on}})
    
{{#if let.include}}
target_include_directories({{@root.cmake.project_name}} PRIVATE 
    {{#each let.include}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.define}}
target_compile_definitions({{@root.cmake.project_name}} PRIVATE 
    {{#each let.define}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.link}}
target_link_libraries({{@root.cmake.project_name}} PRIVATE 
    {{#each let.link}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.feature}}
target_compile_features({{@root.cmake.project_name}} PRIVATE 
    {{#each let.feature}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.option}}
target_compile_options({{@root.cmake.project_name}} PRIVATE 
    {{#each let.option}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.source}}
target_sources({{@root.cmake.project_name}} PRIVATE 
    {{#each let.source}}
    {{this}}
    {{/each}}
)
{{/if~}}
    
{{#if let.custom}}
{{this}}

{{/if~}}
    
endif()
{{/each~}}

{{#custom}}
{{this}}

{{/custom~}}

{{cmake.target}}