import { Button, Container, Text } from '@chakra-ui/react'
import Link from 'next/link'


const NotFound = () => {
  return (
    <Container display="flex" flexDirection="column" alignItems="center" height="100vh" py={28}>
      <Text fontSize="4xl" fontWeight="bold">
        404
      </Text>
      <Text fontSize="lg" mb={8}>
        ページが見つかりませんでした
      </Text>
      <Link href="/">
        <Button>トップページに戻る</Button>
      </Link>
    </Container>
  )
}

export default NotFound
