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

{{#if unscoped.include}}
target_include_directories({{cmake.project_name}} SYSTEM PUBLIC 
    {{#each unscoped.include}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if public.define}}
target_compile_definitions({{cmake.project_name}} PUBLIC 
    {{#each public.define}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if private.define}}
target_compile_definitions({{cmake.project_name}} PRIVATE 
    {{#each private.define}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if unscoped.define}}
target_compile_definitions({{cmake.project_name}} PUBLIC 
    {{#each unscoped.define}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if public.link}}
target_link_libraries({{cmake.project_name}} PUBLIC 
    {{#each public.link}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if private.link}}
target_link_libraries({{cmake.project_name}} PRIVATE 
    {{#each private.link}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if unscoped.link}}
target_link_libraries({{cmake.project_name}} 
    {{#each unscoped.link}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if public.feature}}
target_compile_features({{cmake.project_name}} PUBLIC 
    {{#each public.feature}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if private.feature}}
target_compile_features({{cmake.project_name}} PRIVATE 
    {{#each private.feature}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if unscoped.feature}}
target_compile_features({{cmake.project_name}} PUBLIC 
    {{#each unscoped.feature}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#each public.conditions}}
{{chain}}({{on}})
    
{{#if let.include}}
target_include_directories({{@root.cmake.project_name}} PUBLIC 
    {{#each let.include}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.define}}
target_compile_definitions({{@root.cmake.project_name}} PUBLIC 
    {{#each let.define}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.link}}
target_link_libraries({{@root.cmake.project_name}} PUBLIC 
    {{#each let.link}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.feature}}
target_compile_features({{@root.cmake.project_name}} PUBLIC 
    {{#each let.feature}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.option}}
target_compile_options({{@root.cmake.project_name}} PUBLIC 
    {{#each let.option}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.source}}
target_sources({{@root.cmake.project_name}} PUBLIC 
    {{#each let.source}}
    "{{this}}"
    {{/each}}
)

{{/if~}}

{{#if let.custom}}
{{this}}

{{/if~}}

{{#if otherwise}}
else()
    
{{#if otherwise.include}}
target_include_directories({{@root.cmake.project_name}} PUBLIC 
    {{#each otherwise.include}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.define}}
target_compile_definitions({{@root.cmake.project_name}} PUBLIC 
    {{#each otherwise.define}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.link}}
target_link_libraries({{@root.cmake.project_name}} PUBLIC 
    {{#each otherwise.link}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.feature}}
target_compile_features({{@root.cmake.project_name}} PUBLIC 
    {{#each otherwise.feature}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.option}}
target_compile_options({{@root.cmake.project_name}} PUBLIC 
    {{#each otherwise.option}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.custom}}
{{this}}

{{/if~}}

{{/if~}}
{{endif}}

{{/each~}}

{{#each private.conditions}}
{{chain}}({{on}})
    
{{#if let.include}}
target_include_directories({{@root.cmake.project_name}} PRIVATE 
    {{#each let.include}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.define}}
target_compile_definitions({{@root.cmake.project_name}} PRIVATE 
    {{#each let.define}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.link}}
target_link_libraries({{@root.cmake.project_name}} PRIVATE 
    {{#each let.link}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.feature}}
target_compile_features({{@root.cmake.project_name}} PRIVATE 
    {{#each let.feature}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.option}}
target_compile_options({{@root.cmake.project_name}} PRIVATE 
    {{#each let.option}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.source}}
target_sources({{@root.cmake.project_name}} PRIVATE 
    {{#each let.source}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.custom}}
{{this}}

{{/if~}}

{{#if otherwise}}
else()
    
{{#if otherwise.include}}
target_include_directories({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.include}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.define}}
target_compile_definitions({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.define}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.link}}
target_link_libraries({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.link}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.feature}}
target_compile_features({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.feature}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.option}}
target_compile_options({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.option}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.source}}
target_sources({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.source}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.custom}}
{{this}}

{{/if~}}

{{/if~}}
{{endif}}

{{/each~}}


{{#each unscoped.conditions}}
{{chain}}({{on}})
    
{{#if let.include}}
target_include_directories({{@root.cmake.project_name}} PUBLIC 
    {{#each let.include}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.define}}
target_compile_definitions({{@root.cmake.project_name}} PUBLIC 
    {{#each let.define}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.link}}
target_link_libraries({{@root.cmake.project_name}} PUBLIC 
    {{#each let.link}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.feature}}
target_compile_features({{@root.cmake.project_name}} PUBLIC 
    {{#each let.feature}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.option}}
target_compile_options({{@root.cmake.project_name}} PUBLIC 
    {{#each let.option}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.source}}
target_sources({{@root.cmake.project_name}} PRIVATE 
    {{#each let.source}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if let.custom}}
{{this}}

{{/if~}}

{{#if otherwise}}
else()
    
{{#if otherwise.include}}
target_include_directories({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.include}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.define}}
target_compile_definitions({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.define}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.link}}
target_link_libraries({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.link}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.feature}}
target_compile_features({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.feature}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.option}}
target_compile_options({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.option}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.source}}
target_sources({{@root.cmake.project_name}} PRIVATE 
    {{#each otherwise.source}}
    "{{this}}"
    {{/each}}
)

{{/if~}}
    
{{#if otherwise.custom}}
{{this}}

{{/if~}}

{{/if~}}
{{endif}}

{{/each~}}

{{#custom}}
{{this}}

{{/custom~}}

{{cmake.target}}