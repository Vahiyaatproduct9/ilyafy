if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "/home/grishma/Ideas/ilyafy/ilyafy/node_modules/react-native-reanimated/android/build/intermediates/cxx/Debug/5b1d2d4u/obj/x86/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/grishma/Ideas/ilyafy/ilyafy/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

