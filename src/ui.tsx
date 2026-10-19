import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle} from 'react-native';

export const C={bg:'#0B1116',card:'#142029',cardAlt:'#18262E',accent:'#77E6C2',accentDark:'#193D37',text:'#F2F7F5',muted:'#91A2AB',dim:'#52636B',line:'#273740',amber:'#EDBB75',red:'#F09A96'};
export function Label({children,style}: {children:React.ReactNode;style?:StyleProp<TextStyle>}) {return <Text style={[S.label,style]}>{children}</Text>}
export function H1({children}: {children:React.ReactNode}) {return <Text style={S.h1}>{children}</Text>}
export function H2({children}: {children:React.ReactNode}) {return <Text style={S.h2}>{children}</Text>}
export function Muted({children,style}: {children:React.ReactNode;style?:StyleProp<TextStyle>}) {return <Text style={[S.muted,style]}>{children}</Text>}
export function Panel({children,style}: {children:React.ReactNode;style?:StyleProp<ViewStyle>}) {return <View style={[S.panel,style]}>{children}</View>}
export function Btn({title,onPress,secondary=false,small=false,disabled=false}: {title:string;onPress:()=>void;secondary?:boolean;small?:boolean;disabled?:boolean}){
  return <TouchableOpacity activeOpacity={0.76} accessibilityRole="button" onPress={onPress} disabled={disabled} style={[S.btn,secondary?S.secondary:S.primary,small&&S.small,disabled&&{opacity:0.42}]}><Text style={[S.btnText,secondary?{color:C.text}:{color:C.bg},small&&{fontSize:12}]}>{title}</Text></TouchableOpacity>;
}
export function Chip({title,selected=false,onPress}: {title:string;selected?:boolean;onPress:()=>void}) {return <TouchableOpacity onPress={onPress} accessibilityRole="button" style={[S.chip,selected&&S.chipOn]}><Text style={[S.chipText,selected&&{color:C.bg}]}>{title}</Text></TouchableOpacity>}
export function Row({children,style}: {children:React.ReactNode;style?:StyleProp<ViewStyle>}) {return <View style={[{flexDirection:'row',alignItems:'center'},style]}>{children}</View>}
export function Rule() {return <View style={{height:1,backgroundColor:C.line,marginVertical:14}}/>}
export function Stat({value,label}: {value:string;label:string}) {return <View style={{flex:1}}><Text style={{fontSize:25,fontWeight:'800',color:C.text,letterSpacing:-1}}>{value}</Text><Muted style={{fontSize:11,marginTop:3}}>{label}</Muted></View>}
export const S=StyleSheet.create({
  screen:{flex:1,backgroundColor:C.bg},content:{paddingHorizontal:21,paddingTop:13,paddingBottom:120},
  eyebrow:{fontSize:10,fontWeight:'800',color:C.accent,letterSpacing:2.2,textTransform:'uppercase'},
  h1:{fontSize:31,fontWeight:'800',letterSpacing:-1.2,color:C.text,lineHeight:38},
  h2:{fontSize:19,fontWeight:'800',letterSpacing:-0.4,color:C.text},
  label:{fontSize:13,fontWeight:'700',color:C.text},muted:{color:C.muted,fontSize:13,lineHeight:19},
  panel:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:20,padding:17,marginBottom:12},
  primary:{backgroundColor:C.accent},secondary:{backgroundColor:C.cardAlt,borderWidth:1,borderColor:C.line},
  btn:{paddingVertical:15,paddingHorizontal:17,borderRadius:13,alignItems:'center',justifyContent:'center'},
  small:{paddingVertical:9,paddingHorizontal:12,borderRadius:11},
  btnText:{fontSize:14,fontWeight:'800',letterSpacing:0.2},
  chip:{paddingHorizontal:13,paddingVertical:9,borderWidth:1,borderColor:C.line,backgroundColor:C.card,borderRadius:11,marginRight:7,marginBottom:7},
  chipOn:{backgroundColor:C.accent,borderColor:C.accent},chipText:{fontSize:12,fontWeight:'700',color:C.muted},
  input:{backgroundColor:C.cardAlt,color:C.text,borderColor:C.line,borderWidth:1,borderRadius:12,paddingHorizontal:13,paddingVertical:11,fontSize:14},
  circle:{backgroundColor:C.accentDark,width:46,height:46,borderRadius:14,justifyContent:'center',alignItems:'center'},
});
