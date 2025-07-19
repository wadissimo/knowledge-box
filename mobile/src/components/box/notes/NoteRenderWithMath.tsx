import React, { useMemo } from 'react';
import { useWindowDimensions, StyleSheet, ScrollView } from 'react-native';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';
import RenderHtml, {
  HTMLElementModel,
  HTMLContentModel,
  MixedStyleDeclaration,
  CustomRenderer, // Still useful for typing individual renderers if desired
  CustomTagRendererRecord, // <-- Corrected: This is the type for the 'renderers' prop
} from 'react-native-render-html';

// Utility to replace LaTeX with custom <math> tags
const processHtmlForMath = (htmlString: string): string => {
  // Regex for inline math: $...$ or \(...\)
  const inlineMathRegex = /(\$\$?)(.*?)(\$?\s*?\$\$?)/g; // Matches $...$ and $$...$$
  const processedInline = htmlString.replace(inlineMathRegex, (match, p1, p2, p3) => {
    if (p1 === '$' && p3 === '$') {
      return `<math-inline>${p2}</math-inline>`;
    } else if (p1 === '$$' && p3 === '$$') {
      return `<math-block>${p2}</math-block>`;
    }
    return match; // Return original if not matched as a specific type
  });

  return processedInline;
};

interface MathRendererProps {
  tnode: any; // Type from react-native-render-html for the HTML node
  inline?: boolean;
}

const MathRenderer: React.FC<MathRendererProps> = ({ tnode, inline }) => {
  const latexContent = tnode.domNode?.children?.[0]?.data || '';
  if (!latexContent) {
    return null;
  }

  // Ensure backslashes are correctly handled for MathJaxSvg.
  // The example '$\\LaTeX$' implies single backslash in HTML.
  // If MathJaxSvg needs double backslashes in JS string literals, re-escape.
  // Otherwise, pass as is.
  // For most cases with react-native-mathjax-text-svg, the unescaped LaTeX from render-html
  // (e.g., `\LaTeX`) should work directly.
  const processedLatex = latexContent; // No re-escaping needed usually if from HTML parsing.
  //const processedLatex = '$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$';
  console.log('processedLatex', processedLatex);
  return (
    <MathJaxSvg
      fontSize={16}
      color="#000000"
      fontCache={true}
      style={inline ? styles.inlineMath : styles.blockMath}
    >
      {`$$\\textstyle ${processedLatex}$$`}
    </MathJaxSvg>
  );
};

export default function NoteRenderWithMath({ content, width }: { content: string; width: number }) {
  //   const htmlString =
  // 'This editor supports $\\LaTeX$ math expressions. $\\sin(x)$ And a block equation: $$\\int_0^1 x^2 dx = \\frac{1}{3}$$';
  const processedHtmlString = processHtmlForMath(content);

  const customHTMLElementModels = useMemo(
    () => ({
      'math-inline': HTMLElementModel.fromCustomModel({
        tagName: 'math-inline',
        contentModel: HTMLContentModel.textual,
      }),
      'math-block': HTMLElementModel.fromCustomModel({
        tagName: 'math-block',
        contentModel: HTMLContentModel.block,
      }),
    }),
    []
  );

  // Corrected: The 'renderers' prop expects a CustomTagRendererRecord
  // which is an object mapping tag names to their respective renderer components/functions.
  const renderers: CustomTagRendererRecord = useMemo(
    () => ({
      'math-inline': (props: any) => <MathRenderer {...props} inline={true} />,
      'math-block': (props: any) => <MathRenderer {...props} inline={false} />,
    }),
    []
  );

  return (
    <ScrollView style={styles.container}>
      <RenderHtml
        contentWidth={width}
        source={{ html: processedHtmlString }}
        customHTMLElementModels={customHTMLElementModels}
        renderers={renderers} // Now correctly typed as CustomTagRendererRecord
        tagsStyles={customTagsStyles}
      />
    </ScrollView>
  );
}

const customTagsStyles = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold' as 'bold',
    marginBottom: 10,
    color: '#333',
  },
  p: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 5,
    color: '#555',
  },
  strong: {
    fontWeight: 'bold' as 'bold',
  },
  em: {
    fontStyle: 'italic' as 'italic',
  },
  a: {
    color: 'blue',
    textDecorationLine: 'underline' as 'underline',
  },
  b: {
    fontWeight: 'bold' as 'bold',
  },
  i: {
    fontStyle: 'italic' as 'italic',
  },
  u: {
    textDecorationLine: 'underline' as 'underline',
  },
  s: {
    textDecorationLine: 'line-through' as 'line-through',
  },
  strike: {
    textDecorationLine: 'line-through' as 'line-through',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  inlineMath: {
    // Styles for inline math if needed
  },
  blockMath: {
    marginVertical: 10,
  },
});
