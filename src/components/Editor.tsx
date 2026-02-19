import { useRef, useState } from 'react'
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { YStack, XStack, Text, Button, Separator } from 'tamagui'
import { StyleSheet } from 'react-native'
import { PRIMARY_COLOR } from '../helper/Theme'

export default function Editor({
  callback,
}: {
  callback: (reason: string) => void
}) {
  const richText = useRef<RichEditor>(null)
  const [feedback, setFeedback] = useState('')

  const createFeebackHTMLStructure = (feedback: string) => {
    return `
      <html>
        <body style="font-family: Arial; font-size: 16px; color: #333;">
          ${feedback}
        </body>
      </html>
    `
  }

  return (
    <YStack
      flex={1}
      backgroundColor="white"
      borderRadius="$6"
      overflow="hidden"
      borderWidth={1}
      borderColor={PRIMARY_COLOR}
    >
      {/* Toolbar */}
      <YStack backgroundColor="$gray2" paddingVertical="$1">
        <RichToolbar
          editor={richText}
          style={styles.richBar}
          iconTint="#555"
          selectedIconTint="#000"
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.heading1,
            actions.heading2,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.alignLeft,
            actions.alignCenter,
            actions.alignRight,
            actions.undo,
            actions.redo,
          ]}
          iconMap={{
            [actions.undo]: ({ tintColor }:{tintColor: any}) => (
              <Ionicons name="arrow-undo" size={21} color={tintColor} />
            ),
            [actions.redo]: ({ tintColor }:{tintColor: any}) => (
              <Ionicons name="arrow-redo" size={21} color={tintColor} />
            ),
            [actions.heading1]: ({ tintColor }:{tintColor: any}) => (
              <Text fontWeight="700" fontSize={19}  color={tintColor}>
                H1
              </Text>
            ),
            [actions.heading2]: ({ tintColor }:{tintColor: any}) => (
              <Text fontWeight="700" fontSize={19}  color={tintColor}>
                H2
              </Text>
            ),
            [actions.blockquote]: ({ tintColor }:{tintColor: any}) => (
              <Entypo name="quote" size={18} color={tintColor} />
            ),
          }}
        />
      </YStack>

      <Separator />

      {/* Editor */}
      <YStack flex={1} padding="$3">
        <RichEditor
          ref={richText}
          placeholder="Write your reason here…"
          style={styles.rich}
          containerStyle={styles.editorContainer}
          initialHeight={200}
          onChange={setFeedback}
        />
      </YStack>

      {/* Submit */}
      <XStack padding="$3">
        <Button
          flex={1}
          size="$6"
          borderRadius="$5"
          backgroundColor="$red10"
          pressStyle={{ opacity: 0.85 }}
          onPress={() => {
            const html = createFeebackHTMLStructure(feedback)
            callback(html)
          }}
        >
          <Text color="white" fontSize={16}  fontWeight="700">
            Discard
          </Text>
        </Button>
      </XStack>
    </YStack>
  )
}

const styles = StyleSheet.create({
  rich: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  richBar: {
    backgroundColor: 'transparent',
    height: 44,
  },
})
