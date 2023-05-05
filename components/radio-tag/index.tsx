import { Box, useRadio, UseRadioProps } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

const RadioTag = (props: PropsWithChildren<UseRadioProps>) => {
  const { getInputProps, getRootProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRootProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="20px"
        boxShadow="md"
        __css={{
          bg: "#ffffff",
          borderColor: "#E3DFE9",
        }}
        _checked={{
          bg: "#8F50E2",
          color: "white",
          borderColor: "#8F50E2",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        _disabled={{
          bg: "#EDEAF1",
          color: "#C4BDCF",
          cursor: "not-allowed",
        }}
        px={8}
        py={2}
      >
        {props.children}
      </Box>
    </Box>
  );
};

export default RadioTag;
