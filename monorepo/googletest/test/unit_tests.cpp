#include <gtest/gtest.h>

TEST_F(ReverseTests, simple )
{
    std::string toRev = "Hello";

    Reverse rev;
    std::string res = rev.reverse(toRev);

    EXPECT_EQ(res, "olleH" );

}