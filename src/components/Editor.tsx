import React, {useRef, useState} from 'react';
import {RichEditor, RichToolbar, actions} from 'react-native-pell-rich-editor';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {YStack, XStack, Text, Button, Separator} from 'tamagui';
import {StyleSheet} from 'react-native';

export default function Editor({
  callback,
}: {
  callback: (reason: string) => void;
}) {
  const richText = useRef<RichEditor>(null);
  const [feedback, setFeedback] = useState('');

  const createFeedbackHTMLStructure = (content: string) => {
    return `
      <html>
        <body style="font-family: -apple-system, Arial; font-size: 16px; line-height: 1.65; color: #1f2937;">
          ${content}
        </body>
      </html>
    `;
  };

  return (
    <YStack
      flex={1}
      backgroundColor="#FAFBFC"
      borderRadius={18}
      borderWidth={1.5}
      borderColor="#E2E8F0"
      overflow="hidden"
      shadowColor="#000"
      shadowOffset={{width: 0, height: 4}}
      shadowOpacity={0.1}
      shadowRadius={12}
      elevation={5}>
      
      {/* Toolbar - New Elegant Look */}
      <YStack 
        backgroundColor="#F8FAFC" 
        paddingVertical="$2.5" 
        borderBottomWidth={1} 
        borderBottomColor="#E2E8F0">
        
        <RichToolbar
          editor={richText}
          style={styles.richBar}
          iconTint="#64748B"
          selectedIconTint="#1E40AF"
          iconSize={23}
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
            [actions.undo]: ({tintColor}:{tintColor: string}) => <Ionicons name="arrow-undo" size={23} color={tintColor} />,
            [actions.redo]: ({tintColor}:{tintColor: string}) => <Ionicons name="arrow-redo" size={23} color={tintColor} />,
            [actions.heading1]: ({tintColor}:{tintColor: string}) => (
              <Text fontWeight="800" fontSize={21} color={tintColor}>H1</Text>
            ),
            [actions.heading2]: ({tintColor}:{tintColor: string}) => (
              <Text fontWeight="700" fontSize={20} color={tintColor}>H2</Text>
            ),
          }}
        />
      </YStack>

      <Separator />

      {/* Editor Area */}
      <YStack flex={1} padding="$4" backgroundColor="white">
        <RichEditor
          ref={richText}
          placeholder="Write detailed reason for discarding this content..."
          style={styles.rich}
          containerStyle={styles.editorContainer}
          initialHeight={260}
          onChange={setFeedback}
          editorStyle={{
            backgroundColor: 'white',
            color: '#1E2937',
            placeholderColor: '#94A3B8',
            //padding: 10,
            contentCSSText: 'font-size: 16.5px; line-height: 1.7;',
          }}
        />
      </YStack>

      {/* Footer - Bold Modern Discard Button */}
      <XStack 
        padding="$4" 
        backgroundColor="white"
        borderTopWidth={1}
        borderTopColor="#E2E8F0">
        
        <Button
          flex={1}
          size="$5"
          borderRadius={14}
          backgroundColor="#DC2626"     // New vibrant red
          pressStyle={{opacity: 0.9, scale: 0.98}}
          onPress={() => {
            if (feedback.trim().length === 0) return;
            const html = createFeedbackHTMLStructure(feedback);
            callback(html);
          }}
          iconAfter={
            <MaterialIcons name="delete-forever" size={26} color="white" />
          }>
          <Text color="white" fontSize={17.5} fontWeight="700">
            Discard Content
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  richBar: {
    backgroundColor: 'transparent',
    height: 52,
  },
  rich: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});