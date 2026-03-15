import React from 'react'
import { AppRegistry } from 'react-native'
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

// Force Next.js to use the react-native-web setup
export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    AppRegistry.registerComponent('Main', () => Main)
    // @ts-ignore
    const { getStyleElement } = AppRegistry.getApplication('Main')
    const styles = [
      <style key="react-native-style" dangerouslySetInnerHTML={{ __html: `html,body,#__next{height:100%}` }} />,
      getStyleElement(),
    ]
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps, styles: React.Children.toArray([initialProps.styles, ...styles]) }
  }

  render() {
    return (
      <Html lang="en" style={{ height: '100%' }}>
        <Head>
           <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        </Head>
        <body style={{ height: '100%', margin: 0 }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
