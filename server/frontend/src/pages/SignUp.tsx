import React, { useState } from "react";
import {
  chakra,
  Box,
  GridItem,
  useColorModeValue,
  Button,
  Center,
  Flex,
  SimpleGrid,
  VisuallyHidden,
  Input,
} from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const SignUp = () => {
  let history = useHistory();
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [HomeID, setHomeID] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("POST SIGNUP");
    axios
      .post("http://homenode.tech/api/user", {
        username: Email,
        name: Name,
        password: Password,
        home_id: HomeID,
      })
      .then((res: any) => {
        const token = res.data.response.token;
        cookies.set("token", token, { path: "/" });
        history.push("/dashboard");
      });
  };

  return (
    <>
      <Navbar />
      <Box px={8} py={24} mx="auto">
        <SimpleGrid
          alignItems="center"
          w={{ base: "full", xl: 11 / 12 }}
          columns={{ base: 1, lg: 11 }}
          gap={{ base: 0, lg: 24 }}
          mx="auto"
        >
          <GridItem
            colSpan={{ base: "auto", lg: 7 }}
            textAlign={{ base: "center", lg: "left" }}
          >
            <chakra.h1
              mb={4}
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="bold"
              lineHeight={{ base: "shorter", md: "none" }}
              color={useColorModeValue("gray.900", "gray.200")}
              letterSpacing={{ base: "normal", md: "tight" }}
            >
              Ready to start your journey?
            </chakra.h1>
            <chakra.p
              mb={{ base: 10, md: 4 }}
              fontSize={{ base: "lg", md: "xl" }}
              color="gray.500"
              letterSpacing="wider"
            >
              Monitor, control, and automate your home all on one site.
            </chakra.p>
          </GridItem>
          <GridItem colSpan={{ base: "auto", md: 4 }}>
            <Box as="form" mb={6} rounded="lg" shadow="xl">
              <Center pb={0} color={useColorModeValue("gray.700", "gray.600")}>
                <chakra.p
                  mb={{ base: 10, md: 4 }}
                  fontSize={{ base: "lg", md: "xl" }}
                  color="gray.500"
                  letterSpacing="wider"
                >
                  Sign Up
                </chakra.p>
              </Center>
              <SimpleGrid
                columns={1}
                px={6}
                py={4}
                spacing={4}
                borderBottom="solid 1px"
                borderColor={useColorModeValue("gray.200", "gray.700")}
              >
                <Flex>
                  <VisuallyHidden>Name</VisuallyHidden>
                  <Input
                    mt={0}
                    type="text"
                    placeholder="Name"
                    isRequired={true}
                    onChange={(e: any) => setName(e.target.value)}
                  />
                </Flex>
                <Flex>
                  <VisuallyHidden>Email Address</VisuallyHidden>
                  <Input
                    mt={0}
                    type="email"
                    placeholder="Email Address"
                    isRequired={true}
                    onChange={(e: any) => setEmail(e.target.value)}
                  />
                </Flex>
                <Flex>
                  <VisuallyHidden>Password</VisuallyHidden>
                  <Input
                    mt={0}
                    type="password"
                    placeholder="Password"
                    isRequired={true}
                    onChange={(e: any) => setPassword(e.target.value)}
                  />
                </Flex>
                <Flex>
                  <VisuallyHidden>Home ID</VisuallyHidden>
                  <Input
                    mt={0}
                    type="text"
                    placeholder="Home ID (given upon purchase of hardware)"
                    isRequired={true}
                    onChange={(e: any) => setHomeID(e.target.value)}
                  />
                </Flex>
                <Button
                  colorScheme="brand"
                  w="full"
                  py={2}
                  type="submit"
                  onClick={(e) => handleSubmit(e)}
                >
                  Sign Up
                </Button>
              </SimpleGrid>
            </Box>
            <chakra.p fontSize="xs" textAlign="center" color="gray.600">
              By signing up you agree to our{" "}
              <chakra.a color="brand.500" cursor="pointer">
                Terms of Service
              </chakra.a>
            </chakra.p>
            <chakra.p fontSize="xs" textAlign="center" color="gray.600">
              Already have an account?{" "}
              <chakra.a
                color="brand.500"
                onClick={() => history.push("/signin")}
                cursor="pointer"
              >
                Sign in here.
              </chakra.a>
            </chakra.p>
          </GridItem>
        </SimpleGrid>
      </Box>
    </>
  );
};

export default SignUp;
